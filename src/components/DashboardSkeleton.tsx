import type { CSSProperties } from 'react'
import { cn } from '../lib/utils'

function Bone({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-[#e8ede8]', className)}
      style={style}
    />
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading the demo dashboard</span>

      <div>
        <Bone className="h-2.5 w-28" />
        <Bone className="mt-3 h-8 w-64 max-w-full" />
        <Bone className="mt-2.5 h-3 w-80 max-w-full" />
      </div>

      <div className="grid gap-4 xl:grid-cols-12 xl:gap-5">
        <div className="relative h-[330px] overflow-hidden rounded-3xl bg-brand-deep p-6 xl:col-span-8">
          <Bone className="h-2.5 w-28 bg-white/10" />
          <Bone className="mt-8 h-8 w-40 bg-white/15" />
          <Bone className="mt-3 h-3 w-56 bg-white/10" />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-[68px] rounded-xl bg-white/[0.06] p-3">
                <Bone className="h-2 w-16 bg-white/10" />
                <Bone className="mt-3 h-4 w-12 bg-white/15" />
              </div>
            ))}
          </div>
          <Bone className="mt-7 h-8 w-52 bg-white/10" />
        </div>

        <div className="card h-[330px] p-6 xl:col-span-4">
          <div className="flex items-center justify-between">
            <Bone className="h-10 w-32" />
            <Bone className="h-6 w-11 rounded-full" />
          </div>
          <div className="mt-7 flex items-center gap-5">
            <div className="h-[116px] w-[116px] shrink-0 animate-pulse rounded-full border-[9px] border-[#edf1ec]" />
            <div className="flex-1">
              <Bone className="h-2 w-20" />
              <Bone className="mt-3 h-7 w-24" />
              <Bone className="mt-3 h-2 w-28" />
            </div>
          </div>
          <Bone className="mt-6 h-[94px] rounded-2xl bg-[#f3f6f2]" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="card h-[146px] p-5">
            <div className="flex items-start justify-between">
              <Bone className="h-9 w-9 rounded-xl" />
              <Bone className="h-4 w-14 rounded-full" />
            </div>
            <Bone className="mt-5 h-2 w-20" />
            <Bone className="mt-2.5 h-6 w-24" />
            <Bone className="mt-4 h-2 w-full" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-12 xl:gap-5">
        <div className="card h-[410px] p-6 xl:col-span-7">
          <div className="flex justify-between">
            <Bone className="h-10 w-44" />
            <Bone className="h-6 w-24 rounded-full" />
          </div>
          <Bone className="mt-6 h-8 w-full rounded-xl bg-[#f3f6f2]" />
          <div className="mt-4 space-y-3">
            {[0, 1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center gap-3 py-1">
                <Bone className="h-10 w-10 shrink-0 rounded-xl" />
                <div className="flex-1">
                  <Bone className="h-2.5 w-2/3" />
                  <Bone className="mt-2 h-2 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card h-[410px] p-6 xl:col-span-5">
          <div className="flex justify-between">
            <Bone className="h-10 w-36" />
            <Bone className="h-6 w-20 rounded-full" />
          </div>
          <div className="mt-5 space-y-4">
            {[0, 1, 2].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <Bone className="h-10 w-10 shrink-0 rounded-xl" />
                <div className="flex-1">
                  <Bone className="h-2.5 w-3/4" />
                  <Bone className="mt-2 h-2 w-1/3" />
                </div>
              </div>
            ))}
          </div>
          <Bone className="mt-8 h-11 w-full rounded-xl" />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12 xl:gap-5">
        <div className="card h-[360px] p-6 xl:col-span-7">
          <div className="flex justify-between">
            <Bone className="h-10 w-40" />
            <Bone className="h-6 w-20 rounded-full" />
          </div>
          <div className="mt-6 space-y-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="flex gap-3">
                <Bone className="h-9 w-9 shrink-0 rounded-full" />
                <div className="flex-1">
                  <Bone className="h-2.5 w-1/2" />
                  <Bone className="mt-2 h-2 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card h-[360px] p-6 xl:col-span-5">
          <Bone className="h-10 w-44" />
          <Bone className="mt-5 h-7 w-28" />
          <div className="mt-6 flex h-32 items-end gap-2">
            {[60, 100, 42, 120, 75, 110, 48].map((height, index) => (
              <div key={index} className="flex-1">
                <Bone className="w-full rounded-sm" style={{ height }} />
              </div>
            ))}
          </div>
          <Bone className="mt-5 h-2 w-40" />
        </div>
      </div>
    </div>
  )
}
