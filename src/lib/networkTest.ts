import type { NetworkTestResult } from '../types'
import { createId } from './utils'

export type { NetworkTestResult }

const DOWNLOAD_TARGET_BYTES = 1024 * 1024 // aim for ~1 MB of download
const UPLOAD_PAYLOAD_BYTES = 256 * 1024 // 256 KB upload payload

async function timeRequest(
  url: string,
  options?: RequestInit,
  maxBytes = DOWNLOAD_TARGET_BYTES,
): Promise<{
  ms: number
  ok: boolean
  statusText: string
  bytes: number
}> {
  const start = performance.now()
  let bytes = 0
  let ok = false
  let statusText = ''

  try {
    const response = await fetch(url, { cache: 'no-cache', ...options })
    ok = response.ok
    statusText = response.statusText

    if (response.body && maxBytes > 0) {
      const reader = response.body.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        bytes += value.byteLength
        if (bytes >= maxBytes) {
          await reader.cancel().catch(() => undefined)
          break
        }
      }
    }

    // Abort the response once we have enough for a speed estimate.
    if (!options?.method || options.method !== 'POST') {
      await response.body?.cancel().catch(() => undefined)
    }
  } catch (cause) {
    statusText = cause instanceof Error ? cause.message : 'Request failed'
  }

  return { ms: performance.now() - start, ok, statusText, bytes }
}

function toMbps(bytes: number, ms: number): number | null {
  if (ms <= 0 || bytes <= 0) return null
  const bits = bytes * 8
  return bits / ms / 1000 // Mbps
}

function validateEndpoint(endpoint: string): { ok: true; url: URL } | { ok: false; error: string } {
  let parsed: URL
  try {
    parsed = new URL(endpoint)
  } catch {
    return { ok: false, error: 'Invalid URL.' }
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, error: 'Only http:// and https:// endpoints are supported.' }
  }
  return { ok: true, url: parsed }
}

export async function runNetworkTest(endpoint: string | null): Promise<NetworkTestResult> {
  const id = createId()
  const testedAt = new Date().toISOString()

  if (!endpoint) {
    return {
      id,
      endpoint: null,
      latencyMs: null,
      downloadMbps: null,
      uploadMbps: null,
      testedAt,
      error: 'No network test endpoint configured.',
      available: false,
    }
  }

  const validation = validateEndpoint(endpoint)
  if (!validation.ok) {
    return {
      id,
      endpoint,
      latencyMs: null,
      downloadMbps: null,
      uploadMbps: null,
      testedAt,
      error: validation.error,
      available: false,
    }
  }
  const url = validation.url.toString()

  // 1. Latency — time a lightweight GET to the endpoint (headers only).
  const latency = await timeRequest(url, undefined, 0)

  let downloadMbps: number | null = null
  let uploadMbps: number | null = null
  let error: string | null = latency.ok ? null : `Endpoint responded ${latency.statusText}.`

  // Only attempt speed measurements when the endpoint is reachable.
  if (latency.ok) {
    // 2. Download — stream the response and measure throughput.
    try {
      const download = await timeRequest(url, { method: 'GET' })
      if (download.ok) {
        downloadMbps = toMbps(download.bytes, download.ms)
        if (downloadMbps === null) {
          error = error || 'Download completed but no usable throughput was measured.'
        }
      } else {
        error = error || `Download failed: ${download.statusText}.`
      }
    } catch (cause) {
      error = error || `Download error: ${cause instanceof Error ? cause.message : String(cause)}.`
    }

    // 3. Upload — POST a fixed-size payload and measure throughput.
    try {
      const payload = new ArrayBuffer(UPLOAD_PAYLOAD_BYTES)
      const start = performance.now()
      const upload = await fetch(url, {
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'application/octet-stream' },
        cache: 'no-cache',
      })
      const ms = performance.now() - start

      if (upload.ok) {
        uploadMbps = toMbps(UPLOAD_PAYLOAD_BYTES, ms)
        if (uploadMbps === null) {
          error = error || 'Upload completed but no usable throughput was measured.'
        }
      } else {
        error = error || `Upload failed: ${upload.statusText}.`
      }
    } catch (cause) {
      error = error || `Upload error: ${cause instanceof Error ? cause.message : String(cause)}.`
    }
  }

  const available = error === null && latency.ok && downloadMbps !== null && uploadMbps !== null

  return {
    id,
    endpoint,
    latencyMs: latency.ok ? Math.round(latency.ms) : null,
    downloadMbps,
    uploadMbps,
    testedAt,
    error,
    available,
  }
}

export function formatLatency(ms: number | null): string {
  return ms === null ? '—' : `${ms} ms`
}

export function formatSpeed(mbps: number | null): string {
  return mbps === null ? '—' : `${mbps.toFixed(2)} Mbps`
}

export function testStatusLabel(result: NetworkTestResult): string {
  if (!result.available) {
    if (result.error) return `Unavailable — ${result.error}`
    return 'Unavailable'
  }
  return 'Completed'
}
