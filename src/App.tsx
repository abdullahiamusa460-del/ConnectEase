import { CalendarDays, Wifi, WifiOff } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityFeed } from './components/ActivityFeed'
import { ConnectionCard } from './components/ConnectionCard'
import { DashboardSkeleton } from './components/DashboardSkeleton'
import { DataSaverCard } from './components/DataSaverCard'
import { DemoNotice } from './components/DemoNotice'
import { MobileNav } from './components/MobileNav'
import { NetworkReportsPage } from './pages/NetworkReportsPage'
import { NetworkTestPage } from './pages/NetworkTestPage'
import { OfflineBanner } from './components/OfflineBanner'
import { OfflineLibrary } from './components/OfflineLibrary'
import { Sidebar } from './components/Sidebar'
import { StatCards } from './components/StatCards'
import { SyncQueue } from './components/SyncQueue'
import { Toast } from './components/Toast'
import { Topbar } from './components/Topbar'
import { UsageCard } from './components/UsageCard'
import {
  demoUser,
  initialActivities,
  initialOfflineItems,
  initialSyncItems,
  plan,
} from './data/demo'
import { useHashRoute } from './hooks/useHashRoute'
import { useNetworkReports } from './hooks/useNetworkTests'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { useServiceWorker } from './hooks/useServiceWorker'
import { useSettings } from './hooks/useSettings'
import { useSync } from './hooks/useSync'
import { useWorkspaceData } from './hooks/useWorkspaceData'
import type {
  AppSettings,
  NetworkReportInput,
  OfflineItem,
  ToastMessage,
  ToastTone,
} from './types'
import { formatLongDate, formatMB, formatTime, getGreeting } from './lib/utils'
import { SettingsPage } from './pages/SettingsPage'
import { SyncPage } from './pages/SyncPage'
import { WorkspacePage } from './pages/WorkspacePage'
import { removeRemoteReport } from './lib/api'

export default function App() {
  const { route, navigate, navigateToSection } = useHashRoute()
  const isOnline = useOnlineStatus()
  const { settings, updateSetting, resetSettings } = useSettings()
  const {
    records,
    changes,
    isLoading: isWorkspaceLoading,
    error: workspaceError,
    reload: reloadWorkspace,
    create: createWorkspaceRecord,
    update: updateWorkspaceRecord,
    remove: deleteWorkspaceRecord,
    addSamples: addSampleRecords,
  } = useWorkspaceData()
  const serviceWorkerStatus = useServiceWorker()
  const {
    reports,
    isLoading: isReportsLoading,
    error: reportsError,
    reload: reloadReports,
    add: addNetworkReport,
    remove: removeNetworkReport,
    addSamples: addSampleNetworkReports,
  } = useNetworkReports()

  const [isLoading, setIsLoading] = useState(true)
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false)
  const [syncItems, setSyncItems] = useState(initialSyncItems)
  const [isSyncing, setIsSyncing] = useState(false)
  const [activities, setActivities] = useState(initialActivities)
  const [offlineItems] = useState(initialOfflineItems)
  const [lastUpdated, setLastUpdated] = useState(() => formatTime())
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [showDemoNotice, setShowDemoNotice] = useState(true)

  const toastCount = useRef(0)
  const refreshTimer = useRef<number | null>(null)
  const syncTimer = useRef<number | null>(null)

  const isOffline = isSimulatedOffline || !isOnline
  const [activeSection, setActiveSection] = useState<string>('overview')

  const notify = useCallback((message: string, tone: ToastTone = 'info') => {
    toastCount.current += 1
    setToast({ id: toastCount.current, message, tone })
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  const handleSynced = useCallback(async () => {
    await Promise.all([reloadWorkspace(), reloadReports()])
  }, [reloadWorkspace, reloadReports])

  const sync = useSync({
    isOnline,
    isSimulatedOffline,
    autoSync: settings.autoSync,
    pendingChanges: changes.length,
    onSynced: handleSynced,
  })

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 750)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    return () => {
      if (refreshTimer.current !== null) window.clearTimeout(refreshTimer.current)
      if (syncTimer.current !== null) window.clearTimeout(syncTimer.current)
    }
  }, [])

  const handleRefresh = useCallback(() => {
    if (route !== 'dashboard') {
      if (route === 'workspace') {
        void reloadWorkspace()
        notify('Local workspace reloaded from this device.', 'info')
      } else if (route === 'network-reports') {
        void reloadReports()
        notify('Reports reloaded from this device.', 'info')
      }
      return
    }

    if (isLoading) return
    setIsLoading(true)
    if (refreshTimer.current !== null) window.clearTimeout(refreshTimer.current)
    refreshTimer.current = window.setTimeout(() => {
      setIsLoading(false)
      setLastUpdated(formatTime())
      notify('Demo dashboard refreshed with the latest sample data.', 'info')
    }, 800)
  }, [isLoading, notify, reloadWorkspace, route])

  const handleToggleDataSaver = useCallback(() => {
    const next = !settings.dataSaver
    updateSetting('dataSaver', next)
    notify(
      next
        ? 'Demo: data saver is on. Images and video are optimised.'
        : 'Demo: data saver is off. Full-quality media will be used.',
      next ? 'success' : 'info',
    )
  }, [notify, settings.dataSaver, updateSetting])

  const handleSettingChange = useCallback(
    (key: keyof AppSettings, value: boolean) => {
      updateSetting(key, value)
    },
    [updateSetting],
  )

  const handleToggleOffline = useCallback(() => {
    const next = !isSimulatedOffline
    setIsSimulatedOffline(next)

    if (next && syncTimer.current !== null) {
      window.clearTimeout(syncTimer.current)
      syncTimer.current = null
      setIsSyncing(false)
    }

    setActivities((previous) =>
      [
        {
          id: `activity-network-${Date.now()}`,
          title: next
            ? 'Offline simulation enabled'
            : isOnline
              ? 'Reconnected to MTN 4G LTE'
              : 'Offline simulation disabled',
          detail: next
            ? 'Saved content stays available until the simulation ends.'
            : isOnline
              ? 'Strong signal in Ikeja, Lagos. Sync can resume.'
              : 'The device is still offline. Saved content remains available.',
          time: 'Just now',
          category: 'network' as const,
        },
        ...previous,
      ].slice(0, 6),
    )

    notify(
      next
        ? 'Demo: offline simulation on. Your saved content is still available.'
        : isOnline
          ? 'Demo: back online. Pending items can sync again.'
          : 'Demo: simulation off, but the device is still offline.',
      next ? 'warning' : isOnline ? 'success' : 'warning',
    )
  }, [isOnline, isSimulatedOffline, notify])

  const handleSync = useCallback(() => {
    if (isOffline || isSyncing || syncItems.length === 0) return

    const count = syncItems.length
    setIsSyncing(true)
    notify(`Demo preview started. Checking ${count} sample queue items locally.`, 'info')

    syncTimer.current = window.setTimeout(() => {
      setIsSyncing(false)
      syncTimer.current = null
      setSyncItems([])
      setActivities((previous) =>
        [
          {
            id: `activity-sync-${Date.now()}`,
            title: 'Demo sync queue previewed',
            detail: `Cleared ${count} sample items locally. No data was uploaded.`,
            time: 'Just now',
            category: 'sync' as const,
          },
          ...previous,
        ].slice(0, 6),
      )
      notify(
        `Demo preview complete — ${count} sample items cleared locally. No server was contacted.`,
        'info',
      )
    }, 1900)
  }, [isOffline, isSyncing, notify, syncItems.length])

  const handleRestoreQueue = useCallback(() => {
    setSyncItems(initialSyncItems)
    notify('Demo sync queue restored for testing.', 'info')
  }, [notify])

  const handleOpenOfflineItem = useCallback(
    (item: OfflineItem) => {
      notify(`Demo: “${item.title}” would open from your offline library.`, 'info')
    },
    [notify],
  )

  const handleCheckSync = useCallback(async () => {
    if (isOffline) {
      notify(
        'Still offline. Your records and queued changes are saved safely on this device.',
        'warning',
      )
      return
    }

    if (!sync.isConfigured) {
      notify(
        'No sync server is configured for this build. Your changes stay saved on this device.',
        'info',
      )
      return
    }

    const summary = await sync.syncNow()
    if (!summary) {
      notify(
        sync.error ?? 'Sync could not be completed. Your changes remain queued locally.',
        'warning',
      )
      return
    }

    const parts: string[] = []
    if (summary.changes > 0) parts.push(`${summary.changes} queued change${summary.changes === 1 ? '' : 's'}`)
    if (summary.reports > 0) parts.push(`${summary.reports} report${summary.reports === 1 ? '' : 's'}`)
    if (summary.tests > 0) parts.push(`${summary.tests} test result${summary.tests === 1 ? '' : 's'}`)
    if (summary.skipped > 0) parts.push(`${summary.skipped} item${summary.skipped === 1 ? '' : 's'} skipped`)
    notify(
      parts.length > 0
        ? `Sync complete — ${parts.join(', ')} sent to the server.`
        : 'Sync complete. Everything is up to date.',
      'success',
    )
  }, [isOffline, notify, sync])

  const handleAddReport = useCallback(
    async (input: NetworkReportInput) => {
      const report = await addNetworkReport(input)
      sync.requestSync()
      return report
    },
    [addNetworkReport, sync],
  )

  const handleRemoveReport = useCallback(
    async (id: string) => {
      const report = reports.find((item) => item.id === id)
      await removeNetworkReport(id)

      if (report?.syncedAt && !isOffline) {
        try {
          await removeRemoteReport(id)
        } catch {
          notify(
            'Report removed from this device. The server copy could not be deleted.',
            'warning',
          )
        }
      }
    },
    [isOffline, notify, removeNetworkReport, reports, sync],
  )

  const offlineSize = offlineItems.reduce((sum, item) => sum + item.sizeMB, 0)
  const syncSize = syncItems.reduce((sum, item) => sum + item.sizeMB, 0)
  const statusLabel = !isOnline
    ? 'Device offline'
    : isSimulatedOffline
      ? 'Offline demo'
      : 'MTN 4G · Online'

  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to dashboard
      </a>

      <Sidebar
        route={route}
        activeSection={activeSection}
        demoQueueCount={syncItems.length}
        pendingChangesCount={changes.length}
        reportsCount={reports.length}
        isOffline={isOffline}
        dataSaverOn={settings.dataSaver}
        onNavigate={navigate}
        onNavigateSection={navigateToSection}
        onSelectSection={setActiveSection}
      />

      <div className="lg:pl-72">
        <Topbar
          route={route}
          dataSaverOn={settings.dataSaver}
          onToggleDataSaver={handleToggleDataSaver}
          isLoading={
            route === 'dashboard'
              ? isLoading
              : route === 'workspace'
                ? isWorkspaceLoading
                : route === 'network-reports'
                  ? isReportsLoading
                  : false
          }
          onRefresh={handleRefresh}
          lastUpdated={lastUpdated}
          isOnline={isOnline}
          isSimulatedOffline={isSimulatedOffline}
        />

        <main
          id="main-content"
          className="mx-auto w-full max-w-[1400px] px-4 pb-28 pt-4 sm:px-6 lg:px-8 lg:pb-12 lg:pt-6"
        >
          {showDemoNotice && (
            <div className="mb-4 sm:mb-5">
              <DemoNotice onDismiss={() => setShowDemoNotice(false)} />
            </div>
          )}

          <OfflineBanner
            isDeviceOffline={!isOnline}
            isSimulatedOffline={isSimulatedOffline}
            onOpenSync={() => navigate('sync')}
          />

          {route === 'workspace' ? (
            <WorkspacePage
              records={records}
              changes={changes}
              isLoading={isWorkspaceLoading}
              error={workspaceError}
              onReload={reloadWorkspace}
              onCreate={createWorkspaceRecord}
              onUpdate={updateWorkspaceRecord}
              onDelete={deleteWorkspaceRecord}
              onAddSamples={addSampleRecords}
              onNotify={notify}
              onOpenSync={() => navigate('sync')}
            />
          ) : route === 'sync' ? (
            <SyncPage
              recordsCount={records.length}
              changes={changes}
              isOnline={isOnline}
              isSimulatedOffline={isSimulatedOffline}
              settings={settings}
              syncStatus={sync.status}
              syncError={sync.error}
              lastSyncedAt={sync.lastSyncedAt}
              onCheckAgain={handleCheckSync}
              onOpenSettings={() => navigate('settings')}
              onOpenWorkspace={() => navigate('workspace')}
            />
          ) : route === 'settings' ? (
            <SettingsPage
              settings={settings}
              onChange={handleSettingChange}
              onReset={resetSettings}
              onNotify={notify}
              serviceWorkerStatus={serviceWorkerStatus}
              recordCount={records.length}
              changeCount={changes.length}
            />
          ) : route === 'network-test' ? (
            <NetworkTestPage
              isOnline={isOnline}
              isSimulatedOffline={isSimulatedOffline}
              onSaveResult={(result) => {
                sync.requestSync()
                notify(
                  `Network test ${result.available ? 'completed' : 'could not complete'}. No speeds are simulated.`,
                  result.available ? 'success' : 'info',
                )
              }}
            />
          ) : route === 'network-reports' ? (
            <NetworkReportsPage
              isOnline={isOnline}
              isSimulatedOffline={isSimulatedOffline}
              reports={reports}
              isLoading={isReportsLoading}
              error={reportsError}
              onReload={reloadReports}
              onAdd={handleAddReport}
              onRemove={handleRemoveReport}
              onAddSamples={addSampleNetworkReports}
              onNotify={notify}
            />
          ) : isLoading ? (
            <DashboardSkeleton />
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {activeSection === 'overview' && (
                <section id="overview" className="scroll-mt-24" aria-labelledby="page-heading">
                  <div className="mb-4 flex flex-wrap items-end justify-between gap-4 sm:mb-5">
                    <div>
                      <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand">
                        Overview
                        <span className="h-1 w-1 rounded-full bg-line" aria-hidden="true" />
                        <span className="font-medium normal-case tracking-normal text-muted">
                          {formatLongDate()}
                        </span>
                      </p>
                      <h1
                        id="page-heading"
                        className="mt-1.5 font-display text-[26px] font-semibold tracking-[-0.03em] text-ink sm:text-[30px]"
                      >
                        {getGreeting()}, {demoUser.firstName}
                      </h1>
                      <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted sm:text-[13px]">
                        Here&apos;s how your connection, saved content and data use are doing today.
                      </p>
                    </div>

                    <div className="hidden items-center gap-2 md:flex">
                      <span className="chip h-8 px-3">
                        <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                        {formatLongDate()}
                      </span>
                      <span
                        className={
                          isOffline
                            ? 'inline-flex h-8 items-center gap-1.5 rounded-full border border-amber/20 bg-amber-soft px-3 text-[10px] font-semibold text-amber'
                            : 'inline-flex h-8 items-center gap-1.5 rounded-full border border-brand/15 bg-brand-soft px-3 text-[10px] font-semibold text-brand-dark'
                        }
                      >
                        {isOffline ? (
                          <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {statusLabel}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-12 xl:gap-5">
                    <div className="min-w-0 xl:col-span-8">
                      <ConnectionCard
                        isOffline={isOffline}
                        isDeviceOffline={!isOnline}
                        onToggleOffline={handleToggleOffline}
                      />
                    </div>
                    <div className="min-w-0 xl:col-span-4">
                      <DataSaverCard
                        enabled={settings.dataSaver}
                        onToggle={handleToggleDataSaver}
                      />
                    </div>
                  </div>

                  <StatCards
                    offlineCount={offlineItems.length}
                    offlineSize={offlineSize}
                    syncCount={syncItems.length}
                    syncSize={syncSize}
                  />

                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted sm:mt-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
                      Plan: {demoUser.plan}
                    </span>
                    <span className="hidden text-line sm:inline" aria-hidden="true">
                      |
                    </span>
                    <span>
                      {plan.remainingGB} GB left · {plan.usedGB} GB used this cycle
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber" aria-hidden="true" />
                      Sample data only
                    </span>
                  </div>
                </section>
              )}

              {activeSection === 'offline' && (
                <section id="offline" className="scroll-mt-24" aria-labelledby="offline-heading">
                  <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
                    <div>
                      <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand">
                        Offline library
                        <span className="h-1 w-1 rounded-full bg-line" aria-hidden="true" />
                      </p>
                      <h2 id="offline-heading" className="mt-1.5 font-display text-[26px] font-semibold tracking-[-0.03em] text-ink sm:text-[30px]">
                        Saved content
                      </h2>
                      <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted sm:text-[13px]">
                        Items stored on this device for offline use.
                      </p>
                    </div>
                  </div>
                  <OfflineLibrary items={offlineItems} onOpenItem={handleOpenOfflineItem} />
                </section>
              )}

              {activeSection === 'sync' && (
                <section id="sync" className="scroll-mt-24" aria-labelledby="sync-heading">
                  <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
                    <div>
                      <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand">
                        Demo sync queue
                        <span className="h-1 w-1 rounded-full bg-line" aria-hidden="true" />
                      </p>
                      <h2 id="sync-heading" className="mt-1.5 font-display text-[26px] font-semibold tracking-[-0.03em] text-ink sm:text-[30px]">
                        Pending sync
                      </h2>
                      <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted sm:text-[13px]">
                        Queued local changes waiting to sync.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSync}
                        disabled={isOffline || isSyncing || syncItems.length === 0}
                        className="btn-secondary disabled:opacity-50"
                      >
                        {isSyncing ? 'Syncing…' : 'Sync now'}
                      </button>
                    </div>
                  </div>
                  <SyncQueue
                    items={syncItems}
                    isOffline={isOffline}
                    isSyncing={isSyncing}
                    onSync={handleSync}
                    onRestore={handleRestoreQueue}
                  />
                </section>
              )}

              {activeSection === 'activity' && (
                <section id="activity" className="scroll-mt-24" aria-labelledby="activity-heading">
                  <div className="grid gap-4 xl:grid-cols-12 xl:gap-5">
                    <div className="min-w-0 xl:col-span-7">
                      <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
                        <div>
                          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand">
                            Recent activity
                            <span className="h-1 w-1 rounded-full bg-line" aria-hidden="true" />
                          </p>
                          <h2 id="activity-heading" className="mt-1.5 font-display text-[26px] font-semibold tracking-[-0.03em] text-ink sm:text-[30px]">
                            Activity feed
                          </h2>
                          <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted sm:text-[13px]">
                            Latest device activity and changes.
                          </p>
                        </div>
                      </div>
                      <ActivityFeed activities={activities} />
                    </div>
                    <div className="min-w-0 xl:col-span-5">
                      <UsageCard dataSaverOn={settings.dataSaver} />
                    </div>
                  </div>
                </section>
              )}

              <footer className="flex flex-col gap-1.5 border-t border-line/80 pb-2 pt-5 text-[10px] leading-relaxed text-muted sm:flex-row sm:items-center sm:justify-between">
                <p>
                  <span className="font-semibold text-ink">ConnectEase</span> · Offline-first
                  dashboard
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
                  Dashboard data is simulated · local records are stored in IndexedDB ·{' '}
                  {formatMB(offlineSize)} saved offline
                </p>
              </footer>
            </div>
          )}
        </main>
      </div>

      <MobileNav route={route} pendingChangesCount={changes.length} reportsCount={reports.length} />
      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  )
}
