'use client'

import type { AlertData } from '../lib/alerts'

export default function AlertBanner({ alert }: { alert: AlertData }) {
  const urgent = alert.severity !== 'moderate'
  const bg = urgent ? 'bg-red-600/95' : 'bg-amber-600/95'
  const label = alert.type === 'earthquake' ? 'Seismic Alert' : 'Active Warning'

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-30 ${bg} backdrop-blur-md`}
      style={{
        animation: 'alert-slide-up 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        borderBottomLeftRadius: 'inherit',
        borderBottomRightRadius: 'inherit',
      }}
    >
      <div className="flex items-center gap-3 px-5 py-3.5">
        {/* Pulsing indicator */}
        <span
          className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-white"
          style={{ animation: 'alert-pulse 1s ease-in-out infinite' }}
        />

        <div className="flex-1 min-w-0">
          <div className="text-white/60 text-[9px] font-bold uppercase tracking-widest mb-0.5">
            {label}
          </div>
          <div className="text-white text-xs font-bold leading-snug">
            {alert.headline}
          </div>
        </div>
      </div>
    </div>
  )
}
