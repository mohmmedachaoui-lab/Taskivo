"use client";

export default function DashboardSkeleton() {
  return (
    <div className="-mx-4 lg:-mx-6 -mt-4 lg:-mt-6 p-4 lg:p-6">
      <div className="bento-grid">
        {/* Hero — 2 cols, 2 rows */}
        <div className="bento-card bento-cyan bento-span-2 bento-row-2 rounded-2xl p-5">
          <div className="space-y-4">
            <div className="h-4 w-40 rounded bg-white/[0.04] shimmer" />
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white/[0.03] shimmer" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-24 rounded bg-white/[0.04] shimmer" />
                <div className="h-6 w-16 rounded bg-white/[0.03] shimmer" />
                <div className="h-2 w-32 rounded bg-white/[0.03] shimmer" />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-8 w-20 rounded-lg bg-white/[0.03] shimmer" />
              <div className="h-8 w-20 rounded-lg bg-white/[0.03] shimmer" />
              <div className="h-8 w-20 rounded-lg bg-white/[0.03] shimmer" />
            </div>
          </div>
        </div>

        {/* Onboarding checklist — 2 cols */}
        <div className="bento-card bento-purple bento-span-2 rounded-2xl p-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-white/[0.04] shimmer" />
              <div className="h-3 w-28 rounded bg-white/[0.04] shimmer" />
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/[0.03] shimmer" />
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-1.5">
                <div className="h-4 w-4 rounded-full bg-white/[0.04] shimmer" />
                <div className="space-y-1 flex-1">
                  <div className="h-2.5 w-32 rounded bg-white/[0.04] shimmer" />
                  <div className="h-2 w-48 rounded bg-white/[0.03] shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 stat cards */}
        {["cyan", "yellow", "cyan", "cyan"].map((v, i) => (
          <div key={i} className={`bento-card bento-${v} rounded-2xl p-5`}>
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-white/[0.04] shimmer" />
              <div className="h-7 w-14 rounded bg-white/[0.03] shimmer" />
              <div className="h-2 w-16 rounded bg-white/[0.03] shimmer" />
            </div>
          </div>
        ))}

        {/* Goal card */}
        <div className="bento-card bento-cyan rounded-2xl p-5">
          <div className="space-y-3">
            <div className="h-3 w-24 rounded bg-white/[0.04] shimmer" />
            <div className="h-20 w-20 mx-auto rounded-full bg-white/[0.03] shimmer" />
            <div className="h-2 w-full rounded bg-white/[0.03] shimmer" />
          </div>
        </div>

        {/* Weekly activity — 2 cols */}
        <div className="bento-card bento-cyan bento-span-2 rounded-2xl p-5">
          <div className="space-y-3">
            <div className="h-3 w-28 rounded bg-white/[0.04] shimmer" />
            <div className="flex items-end gap-2 h-16">
              {[40, 25, 55, 30, 60, 35, 45].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-white/[0.03] shimmer" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
