import {
  CloudUpload,
  Database,
  DownloadCloud,
  HardDriveDownload,
  Image,
  Info,
  Leaf,
  RefreshCw,
  RotateCcw,
  ServerOff,
  ShieldCheck,
  SlidersHorizontal,
  Wifi,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { AppSettings, ServiceWorkerStatus } from '../types'
import { cn, formatBytes } from '../lib/utils'
import { Switch } from '../components/ui/Switch'

interface SettingsPageProps {
  settings: AppSettings
  onChange: (key: keyof AppSettings, value: boolean) => void
  onReset: () => void
  onNotify: (message: string, tone?: 'success' | 'info' | 'warning') => void
  serviceWorkerStatus: ServiceWorkerStatus
  recordCount: number
  changeCount: number
}

interface SettingRowProps {
  icon: LucideIcon
  title: string
  description: string
  checked: boolean
  onChange: () => void
  disabled?: boolean
}

function SettingRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
  disabled = false,
}: SettingRowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-2xl border border-line/70 bg-canvas/40 px-3.5 py-3 transition-opacity',
        disabled && 'opacity-55',
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-muted ring-1 ring-line">
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-ink">{title}</p>
          <p className="mt-0.5 text-[9px] leading-relaxed text-muted">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onChange={onChange} label={title} disabled={disabled} />
    </div>
  )
}

const serviceWorkerCopy: Record<
  ServiceWorkerStatus,
  { label: string; detail: string; tone: string }
> = {
  ready: {
    label: 'Active',
    detail: 'The app shell is cached and can open without a network.',
    tone: 'border-brand/10 bg-brand-soft text-brand-dark',
  },
  registering: {
    label: 'Starting…',
    detail: 'The offline cache is being prepared.',
    tone: 'border-[#4169a8]/10 bg-[#eef2fb] text-[#4169a8]',
  },
  dev: {
    label: 'Production only',
    detail: 'Disabled in dev so hot reload stays reliable. Test with build + preview.',
    tone: 'border-amber/20 bg-amber-soft text-amber',
  },
  unsupported: {
    label: 'Not supported',
    detail: 'This browser cannot register a service worker.',
    tone: 'border-amber/20 bg-amber-soft text-amber',
  },
  error: {
    label: 'Registration failed',
    detail: 'The app still works, but offline caching is unavailable.',
    tone: 'border-[#b4544e]/10 bg-[#fbeceb] text-[#b4544e]',
  },
}

export function SettingsPage({
  settings,
  onChange,
  onReset,
  onNotify,
  serviceWorkerStatus,
  recordCount,
  changeCount,
}: SettingsPageProps) {
  const [storage, setStorage] = useState<{ usage: number; quota: number } | null>(null)
  const [cacheBuckets, setCacheBuckets] = useState<number | null>(null)
  const worker = serviceWorkerCopy[serviceWorkerStatus]

  useEffect(() => {
    let active = true

    if (navigator.storage?.estimate) {
      navigator.storage
        .estimate()
        .then((estimate) => {
          if (active) {
            setStorage({ usage: estimate.usage ?? 0, quota: estimate.quota ?? 0 })
          }
        })
        .catch(() => undefined)
    }

    if (typeof caches !== 'undefined') {
      caches
        .keys()
        .then((names) => {
          if (active) setCacheBuckets(names.length)
        })
        .catch(() => undefined)
    }

    return () => {
      active = false
    }
  }, [])

  const toggle = (key: keyof AppSettings, value: boolean, label: string) => {
    onChange(key, value)
    onNotify(`${label} ${value ? 'enabled' : 'disabled'}. Preference saved locally.`, 'info')
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <section aria-labelledby="settings-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow flex items-center gap-2">
              Preferences
              <span className="h-1 w-1 rounded-full bg-line" aria-hidden="true" />
              <span className="font-medium normal-case tracking-normal text-muted">
                IndexedDB · local only
              </span>
            </p>
            <h1
              id="settings-heading"
              className="mt-1.5 font-display text-[26px] font-semibold tracking-[-0.03em] text-ink sm:text-[30px]"
            >
              Data &amp; sync settings
            </h1>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted sm:text-[13px]">
              Control optional downloads, data saving and how local changes will sync when a
              backend is available.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onReset()
              onNotify('Preferences reset to their default values.', 'info')
            }}
            className="btn-secondary"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset defaults
          </button>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-12 xl:gap-5">
        <div className="min-w-0 space-y-4 xl:col-span-8">
          <section className="card p-5 sm:p-6" aria-labelledby="data-saver-settings">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime-soft text-brand-dark">
                <Leaf className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <div>
                <h2 id="data-saver-settings" className="font-display text-[15px] font-semibold">
                  Data saver
                </h2>
                <p className="mt-0.5 text-[11px] text-muted">
                  Reduce optional data use while keeping the workspace available.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              <SettingRow
                icon={Leaf}
                title="Data saver"
                description="Compress images and limit background data use."
                checked={settings.dataSaver}
                onChange={() =>
                  toggle('dataSaver', !settings.dataSaver, 'Data saver')
                }
              />
              <SettingRow
                icon={Image}
                title="Compress images"
                description="Use lighter images when data saver is enabled."
                checked={settings.compressImages}
                disabled={!settings.dataSaver}
                onChange={() =>
                  toggle('compressImages', !settings.compressImages, 'Image compression')
                }
              />
            </div>
          </section>

          <section className="card p-5 sm:p-6" aria-labelledby="download-settings">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef2fb] text-[#4169a8]">
                <DownloadCloud className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <div>
                <h2 id="download-settings" className="font-display text-[15px] font-semibold">
                  Optional downloads
                </h2>
                <p className="mt-0.5 text-[11px] text-muted">
                  Choices saved for future resource downloads.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              <SettingRow
                icon={DownloadCloud}
                title="Keep saved resources updated"
                description="Allow content you saved to refresh when a connection is available."
                checked={settings.autoDownloadUpdates}
                onChange={() =>
                  toggle(
                    'autoDownloadUpdates',
                    !settings.autoDownloadUpdates,
                    'Optional downloads',
                  )
                }
              />
              <SettingRow
                icon={Wifi}
                title="Download only on Wi-Fi"
                description="Wait for Wi-Fi before fetching optional updates or media."
                checked={settings.downloadOnWifiOnly}
                onChange={() =>
                  toggle('downloadOnWifiOnly', !settings.downloadOnWifiOnly, 'Wi-Fi downloads')
                }
              />
            </div>
          </section>

          <section className="card p-5 sm:p-6" aria-labelledby="sync-settings">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
                <RefreshCw className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <div>
                <h2 id="sync-settings" className="font-display text-[15px] font-semibold">
                  Synchronisation
                </h2>
                <p className="mt-0.5 text-[11px] text-muted">
                  These preferences will apply once a backend exists.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              <SettingRow
                icon={Wifi}
                title="Sync only on Wi-Fi"
                description="Avoid using mobile data for future sync transfers."
                checked={settings.syncOnWifiOnly}
                onChange={() =>
                  toggle('syncOnWifiOnly', !settings.syncOnWifiOnly, 'Wi-Fi-only sync')
                }
              />
              <SettingRow
                icon={RefreshCw}
                title="Retry automatically"
                description="Check for a sync server again when the connection returns."
                checked={settings.autoSync}
                onChange={() => toggle('autoSync', !settings.autoSync, 'Automatic retry')}
              />
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber/20 bg-amber-soft/65 px-3.5 py-3 text-[10px] leading-relaxed text-[#7d5a19]">
              <ServerOff className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber" aria-hidden="true" />
              <span>
                No sync server is connected. These settings are stored locally and do not upload
                anything. Local changes remain queued until a real backend is added.
              </span>
            </div>
          </section>
        </div>

        <div className="min-w-0 space-y-4 xl:col-span-4">
          <section className="card p-5 sm:p-6" aria-labelledby="storage-settings">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime-soft text-[#5a7a20]">
                <Database className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <div>
                <h2 id="storage-settings" className="font-display text-[15px] font-semibold">
                  Local storage
                </h2>
                <p className="mt-0.5 text-[11px] text-muted">On this device only.</p>
              </div>
            </div>

            <dl className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-line/70 bg-canvas/45 px-3 py-2.5">
                <dt className="flex items-center gap-1.5 text-[10px] text-muted">
                  <HardDriveDownload className="h-3.5 w-3.5" aria-hidden="true" />
                  Saved records
                </dt>
                <dd className="text-[10px] font-semibold text-ink">{recordCount}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-line/70 bg-canvas/45 px-3 py-2.5">
                <dt className="flex items-center gap-1.5 text-[10px] text-muted">
                  <CloudUpload className="h-3.5 w-3.5" aria-hidden="true" />
                  Pending changes
                </dt>
                <dd className="text-[10px] font-semibold text-ink">{changeCount}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-line/70 bg-canvas/45 px-3 py-2.5">
                <dt className="flex items-center gap-1.5 text-[10px] text-muted">
                  <Database className="h-3.5 w-3.5" aria-hidden="true" />
                  Browser storage
                </dt>
                <dd className="text-[10px] font-semibold text-ink">
                  {storage ? formatBytes(storage.usage) : '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-line/70 bg-canvas/45 px-3 py-2.5">
                <dt className="flex items-center gap-1.5 text-[10px] text-muted">
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                  Cache buckets
                </dt>
                <dd className="text-[10px] font-semibold text-ink">
                  {cacheBuckets === null ? '—' : cacheBuckets}
                </dd>
              </div>
            </dl>

            {storage && storage.quota > 0 && (
              <div className="mt-3">
                <div className="h-1.5 overflow-hidden rounded-full bg-canvas">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#0e7a5f]/70 to-[#69c7a7]"
                    style={{
                      width: `${Math.max(2, Math.min((storage.usage / storage.quota) * 100, 100))}%`,
                    }}
                    role="progressbar"
                    aria-label="Browser storage used"
                    aria-valuenow={Math.round((storage.usage / storage.quota) * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <p className="mt-1.5 text-[9px] text-muted">
                  of {formatBytes(storage.quota)} available to this origin
                </p>
              </div>
            )}

            <p className="mt-3 text-[9px] leading-relaxed text-muted">
              Clearing this site&apos;s browser data removes saved records and preferences.
            </p>
          </section>

          <section className="card p-5 sm:p-6" aria-labelledby="cache-settings">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
                <ShieldCheck className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <div>
                <h2 id="cache-settings" className="font-display text-[15px] font-semibold">
                  Offline app cache
                </h2>
                <p className="mt-0.5 text-[11px] text-muted">Service worker status.</p>
              </div>
            </div>

            <span
              className={cn(
                'mt-4 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-semibold',
                worker.tone,
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  serviceWorkerStatus === 'ready' ? 'bg-brand' : 'bg-amber',
                )}
                aria-hidden="true"
              />
              {worker.label}
            </span>
            <p className="mt-2 text-[10px] leading-relaxed text-muted">{worker.detail}</p>

            <div className="mt-3 flex items-start gap-2 rounded-xl bg-canvas/60 px-3 py-2.5 text-[9px] leading-relaxed text-muted">
              <Info className="mt-0.5 h-3 w-3 shrink-0 text-brand" aria-hidden="true" />
              <span>
                Service worker caching runs in the production build. Development mode skips it so
                Vite hot reload can work normally.
              </span>
            </div>
          </section>

          <p className="flex items-start gap-1.5 px-1 text-[9px] leading-relaxed text-muted">
            <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-brand" aria-hidden="true" />
            Preferences and records are stored in IndexedDB. Nothing is sent to a server in this
            demo.
          </p>
        </div>
      </div>
    </div>
  )
}
