import { ArrowDown, ArrowUp, Clock3, MapPin, ShieldCheck, Timer } from 'lucide-react'
import { connection } from '../data/demo'
import { cn } from '../lib/utils'
import { SignalBars } from './ui/SignalBars'
import { Switch } from './ui/Switch'

interface ConnectionCardProps {
  isOffline: boolean
  isDeviceOffline?: boolean
  onToggleOffline: () => void
}

export function ConnectionCard({
  isOffline,
  isDeviceOffline = false,
  onToggleOffline,
}: ConnectionCardProps) {
  const metrics = [
    {
      label: 'Download',
      value: isOffline ? '—' : connection.download,
      unit: isOffline ? '' : 'Mbps',
      icon: ArrowDown,
    },
    {
      label: 'Upload',
      value: isOffline ? '—' : connection.upload,
      unit: isOffline ? '' : 'Mbps',
      icon: ArrowUp,
    },
    {
      label: 'Latency',
      value: isOffline ? '—' : connection.latency,
      unit: isOffline ? '' : 'ms',
      icon: Timer,
    },
    {
      label: 'Session',
      value: isOffline ? 'Paused' : connection.session,
      unit: '',
      icon: Clock3,
    },
  ]

  return (
    <section
      className={cn(
        'relative h-full overflow-hidden rounded-3xl border p-5 text-white shadow-float transition-colors duration-500 sm:p-7',
        isOffline
          ? 'border-[#3a423d] bg-[#262d29]'
          : 'border-brand-dark/40 bg-brand-deep',
      )}
      aria-labelledby="connection-heading"
    >
      <div className="pointer-events-none absolute inset-0 hero-grid" aria-hidden="true" />
      <div
        className={cn(
          'pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full blur-3xl transition-colors duration-500',
          isOffline ? 'bg-amber/10' : 'bg-[#1f9d78]/25',
        )}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-[#d9952f]/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
                Connection status
              </p>
              <span className="rounded-full border border-white/10 bg-white/[0.07] px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white/55">
                Live demo
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5" aria-hidden="true">
                {!isOffline && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-60" />
                )}
                <span
                  className={cn(
                    'relative inline-flex h-3.5 w-3.5 rounded-full border-2',
                    isOffline
                      ? 'border-amber-100/25 bg-amber-300'
                      : 'border-emerald-100/30 bg-emerald-300',
                  )}
                />
              </span>
              <h2
                id="connection-heading"
                className="font-display text-[26px] font-semibold leading-none tracking-[-0.02em] sm:text-[30px]"
              >
                {isOffline ? (isDeviceOffline ? 'Device offline' : 'Offline mode') : 'Connected'}
              </h2>
            </div>

            <p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/50 sm:text-[13px]">
              {isOffline ? (
                <>
                  <span className="font-medium text-amber-200">
                    {isDeviceOffline ? 'No internet connection' : 'No active network'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Browsing saved content</span>
                </>
              ) : (
                <>
                  <span className="font-semibold text-white/85">
                    {connection.carrier} {connection.technology}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    {connection.location}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Since {connection.connectedSince}</span>
                </>
              )}
            </p>
          </div>

          <div
            className={cn(
              'flex min-w-[138px] items-center gap-3 rounded-2xl border px-3.5 py-3 backdrop-blur-sm',
              isOffline
                ? 'border-white/10 bg-white/[0.05]'
                : 'border-white/10 bg-white/[0.07]',
            )}
          >
            <SignalBars level={isOffline ? 0 : 4} tone="dark" />
            <div>
              <p className="text-[13px] font-semibold leading-tight text-white/95">
                {isOffline ? 'No signal' : connection.signalLabel}
              </p>
              <p className="mt-0.5 text-[10px] text-white/45">
                {isOffline ? 'Waiting to reconnect' : connection.signalDbm}
              </p>
            </div>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <div
                key={metric.label}
                className="rounded-xl border border-white/[0.08] bg-white/[0.055] px-3.5 py-3"
              >
                <dt className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-white/40">
                  <Icon className="h-3 w-3" aria-hidden="true" />
                  {metric.label}
                </dt>
                <dd className="mt-1.5 flex items-baseline gap-1">
                  <span className="font-display text-lg font-semibold leading-none text-white">
                    {metric.value}
                  </span>
                  {metric.unit && (
                    <span className="text-[10px] font-medium text-white/40">{metric.unit}</span>
                  )}
                </dd>
              </div>
            )
          })}
        </dl>

        <div className="mt-5 flex flex-col gap-4 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Switch
              checked={isOffline}
              onChange={onToggleOffline}
              label="Simulate offline mode"
              tone="dark"
            />
            <div>
              <p className="text-xs font-semibold text-white/85">Simulate offline</p>
              <p className="text-[10px] leading-relaxed text-white/40">
                Preview the app without a network.
              </p>
            </div>
          </div>
          <p className="flex items-center gap-1.5 text-[10px] text-white/40 sm:text-right">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
            {isOffline
              ? 'Saved content is still available'
              : `Secure session · ${connection.dataUsed} used`}
          </p>
        </div>
      </div>
    </section>
  )
}
