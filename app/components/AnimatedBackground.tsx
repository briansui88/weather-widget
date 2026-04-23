'use client'

import { useMemo } from 'react'
import type { WeatherCondition } from '../lib/weather'

interface Props {
  condition: WeatherCondition
  isDay: boolean
}

const W = 400
const H = 480
const TREE_BASE_Y = 368

const SKY: Record<WeatherCondition, { day: string[]; night: string[] }> = {
  clear:         { day: ['#1a5fb4', '#5ba4e0'], night: ['#050d1a', '#0e2040'] },
  partly_cloudy: { day: ['#2d6db5', '#6da8d4'], night: ['#0a1525', '#152545'] },
  cloudy:        { day: ['#3d4f5c', '#607080'], night: ['#141e24', '#253040'] },
  foggy:         { day: ['#7a8fa0', '#afc2cf'], night: ['#2a3540', '#3d4f5c'] },
  drizzle:       { day: ['#2a3d4d', '#4a6070'], night: ['#0e1820', '#1e2d38'] },
  rain:          { day: ['#1a2835', '#2e4050'], night: ['#080f16', '#121e2a'] },
  snow:          { day: ['#8aa8c0', '#bdd0df'], night: ['#1a2535', '#2a3848'] },
  thunderstorm:  { day: ['#0d1117', '#1a2030'], night: ['#060a0e', '#10181f'] },
}

const FAR_MTN =  `M0,280 L60,170 L95,205 L155,115 L220,172 L285,85 L345,140 L390,112 L${W},125 L${W},${H} L0,${H} Z`
const NEAR_MTN = `M0,322 L55,237 L90,267 L150,190 L215,242 L278,160 L340,202 L385,180 L${W},190 L${W},${H} L0,${H} Z`
const GROUND =   `M0,${TREE_BASE_Y} Q100,${TREE_BASE_Y - 7} 200,${TREE_BASE_Y} Q300,${TREE_BASE_Y + 6} ${W},${TREE_BASE_Y} L${W},${H} L0,${H} Z`

const TREES = [
  { cx: 22, h: 58 }, { cx: 62, h: 48 }, { cx: 106, h: 63 },
  { cx: 150, h: 46 }, { cx: 196, h: 54 }, { cx: 243, h: 60 },
  { cx: 291, h: 50 }, { cx: 336, h: 56 }, { cx: 376, h: 44 },
]

function PineTree({ cx, h }: { cx: number; h: number }) {
  const b = TREE_BASE_Y
  return (
    <g>
      <polygon points={`${cx},${b - h} ${cx - h * 0.19},${b - h * 0.62} ${cx + h * 0.19},${b - h * 0.62}`} />
      <polygon points={`${cx},${b - h * 0.73} ${cx - h * 0.27},${b - h * 0.37} ${cx + h * 0.27},${b - h * 0.37}`} />
      <polygon points={`${cx},${b - h * 0.48} ${cx - h * 0.35},${b - h * 0.09} ${cx + h * 0.35},${b - h * 0.09}`} />
      <rect x={cx - 2.5} y={b - h * 0.08} width={5} height={h * 0.08 + 4} />
    </g>
  )
}

export default function AnimatedBackground({ condition, isDay }: Props) {
  const sky = SKY[condition][isDay ? 'day' : 'night']

  const showStars     = !isDay
  const showMoon      = !isDay
  const showSun       = isDay && (condition === 'clear' || condition === 'partly_cloudy')
  const showClouds    = ['partly_cloudy', 'cloudy', 'foggy', 'drizzle', 'rain', 'thunderstorm'].includes(condition)
  const showFog       = condition === 'foggy'
  const showRain      = ['rain', 'drizzle', 'thunderstorm'].includes(condition)
  const showSnow      = condition === 'snow'
  const showLightning = condition === 'thunderstorm'
  const showSnowCaps  = condition === 'snow'
  const isDark        = condition === 'thunderstorm'
  const cloudColor    = isDark ? '#141825' : (isDay ? '#c8dce8' : '#3a4f62')
  const rainOpacity   = condition === 'drizzle' ? 0.35 : 0.55

  const stars = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      cx: ((i * 137 + 43) % (W - 24)) + 12,
      cy: ((i * 79 + 18) % 195) + 12,
      r: i % 3 === 0 ? 1.8 : i % 3 === 1 ? 1.2 : 0.8,
      delay: `${((i * 0.43) % 3).toFixed(2)}s`,
      dur: `${2 + (i % 3)}s`,
    })),
  [])

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="bg-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sky[0]} />
          <stop offset="100%" stopColor={sky[1]} />
        </linearGradient>

        {showSun && (
          <radialGradient id="sun-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff5c0" stopOpacity="1" />
            <stop offset="45%" stopColor="#ffd060" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ff8c00" stopOpacity="0" />
          </radialGradient>
        )}

        {showMoon && (
          <radialGradient id="moon-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f5ead0" stopOpacity="0.9" />
            <stop offset="65%" stopColor="#d4c080" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#d4c080" stopOpacity="0" />
          </radialGradient>
        )}

        {showRain && (
          <pattern id="rain-pat" x="0" y="0" width="20" height="35" patternUnits="userSpaceOnUse">
            <line x1="12" y1="0" x2="8" y2="18"
              stroke={`rgba(180,210,240,${rainOpacity})`}
              strokeWidth={condition === 'drizzle' ? '0.9' : '1.3'}
              strokeLinecap="round" />
          </pattern>
        )}

        {showSnow && (
          <pattern id="snow-pat" x="0" y="0" width="38" height="38" patternUnits="userSpaceOnUse">
            <circle cx="19" cy="19" r="2.2" fill="rgba(255,255,255,0.88)" />
            <circle cx="6"  cy="7"  r="1.6" fill="rgba(255,255,255,0.65)" />
            <circle cx="30" cy="11" r="1.1" fill="rgba(255,255,255,0.55)" />
            <circle cx="10" cy="30" r="1.4" fill="rgba(255,255,255,0.72)" />
            <circle cx="30" cy="30" r="1.9" fill="rgba(255,255,255,0.62)" />
          </pattern>
        )}
      </defs>

      {/* Sky */}
      <rect width={W} height={H} fill="url(#bg-sky)" />

      {/* Stars */}
      {showStars && stars.map((s, i) => (
        <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="white"
          style={{ animation: `twinkle ${s.dur} ${s.delay} ease-in-out infinite`, opacity: 0.3 }} />
      ))}

      {/* Moon */}
      {showMoon && (
        <g style={{ animation: 'moon-pulse 5s ease-in-out infinite' }}>
          <circle cx={298} cy={74} r={52} fill="url(#moon-halo)" />
          <circle cx={298} cy={74} r={29} fill="#f0e4c0" />
          {/* Crescent shadow */}
          <circle cx={312} cy={64} r={23} fill={sky[0]} />
        </g>
      )}

      {/* Sun */}
      {showSun && (
        <g>
          <circle cx={318} cy={66} r={58} fill="url(#sun-halo)" />
          <g style={{ transformOrigin: '318px 66px', animation: 'sun-rotate 45s linear infinite' }}>
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i * 45 * Math.PI) / 180
              return (
                <line key={i}
                  x1={318 + Math.cos(a) * 43} y1={66 + Math.sin(a) * 43}
                  x2={318 + Math.cos(a) * 60} y2={66 + Math.sin(a) * 60}
                  stroke="#ffd060" strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
              )
            })}
          </g>
          <circle cx={318} cy={66} r={30} fill="#fffacd"
            style={{ animation: 'sun-pulse 4s ease-in-out infinite', transformOrigin: '318px 66px' }} />
        </g>
      )}

      {/* Clouds */}
      {showClouds && (
        <>
          <g style={{ animation: 'cloud-drift 20s ease-in-out infinite' }}
            opacity={isDark ? 0.95 : isDay ? 0.78 : 0.65}>
            <ellipse cx={78}  cy={56} rx={52} ry={23} fill={cloudColor} />
            <ellipse cx={110} cy={43} rx={40} ry={21} fill={cloudColor} />
            <ellipse cx={48}  cy={49} rx={34} ry={19} fill={cloudColor} />
          </g>
          <g style={{ animation: 'cloud-drift-slow 28s ease-in-out infinite' }}
            opacity={isDark ? 0.9 : isDay ? 0.68 : 0.55}>
            <ellipse cx={270} cy={38} rx={68} ry={26} fill={cloudColor} />
            <ellipse cx={312} cy={25} rx={48} ry={21} fill={cloudColor} />
            <ellipse cx={234} cy={32} rx={42} ry={19} fill={cloudColor} />
          </g>
          {(condition === 'cloudy' || condition === 'rain' || condition === 'thunderstorm') && (
            <g style={{ animation: 'cloud-drift 24s ease-in-out infinite reverse' }}
              opacity={isDark ? 0.85 : 0.75}>
              <ellipse cx={168} cy={72} rx={58} ry={22} fill={cloudColor} />
              <ellipse cx={202} cy={58} rx={42} ry={19} fill={cloudColor} />
              <ellipse cx={140} cy={64} rx={38} ry={17} fill={cloudColor} />
            </g>
          )}
        </>
      )}

      {/* Fog */}
      {showFog && (
        <>
          <rect x={0} y={185} width={W} height={95}  fill="rgba(195,212,222,0.22)" rx={4}
            style={{ animation: 'fog-drift 9s ease-in-out infinite' }} />
          <rect x={0} y={255} width={W} height={75}  fill="rgba(195,212,222,0.18)" rx={4}
            style={{ animation: 'fog-drift 13s ease-in-out infinite reverse' }} />
          <rect x={0} y={305} width={W} height={65}  fill="rgba(195,212,222,0.28)" rx={4}
            style={{ animation: 'fog-drift 11s ease-in-out infinite' }} />
        </>
      )}

      {/* Rain */}
      {showRain && (
        <g style={{ animation: 'rain-scroll 0.55s linear infinite' }}>
          <rect x={-30} y={-35} width={W + 50} height={H + 35} fill="url(#rain-pat)" />
        </g>
      )}

      {/* Snow */}
      {showSnow && (
        <g style={{ animation: 'snow-scroll 5s linear infinite' }}>
          <rect x={0} y={0} width={W} height={H * 2} fill="url(#snow-pat)" />
        </g>
      )}

      {/* Lightning */}
      {showLightning && (
        <g style={{ animation: 'lightning-flash 7s 1.5s ease-in-out infinite', opacity: 0 }}>
          <polyline
            points="218,72 203,132 214,132 196,198 208,198 186,274"
            stroke="#ddd8ff" strokeWidth="2.5" fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
          <rect x={0} y={0} width={W} height={H} fill="rgba(200,200,255,0.06)" />
        </g>
      )}

      {/* Far mountains */}
      <path d={FAR_MTN} fill="rgba(10,20,32,0.48)" />

      {/* Near mountains */}
      <path d={NEAR_MTN} fill="rgba(6,13,22,0.72)" />

      {/* Snow caps */}
      {showSnowCaps && (
        <g fill="rgba(218,232,245,0.82)">
          <polygon points="155,115 178,142 155,148 132,142" />
          <polygon points="285,85 310,113 285,119 260,113" />
          <polygon points="150,190 170,212 150,217 130,212" />
          <polygon points="278,160 298,182 278,187 258,182" />
        </g>
      )}

      {/* Ground / water */}
      <path d={GROUND} fill="rgba(5,11,19,0.9)" />

      {/* Water shimmer */}
      <rect x={0} y={TREE_BASE_Y} width={W} height={7} fill="rgba(100,155,205,0.08)" />
      <rect x={45} y={TREE_BASE_Y + 3} width={110} height={2.5} fill="rgba(140,185,215,0.12)" rx={1.5} />
      <rect x={225} y={TREE_BASE_Y + 2} width={85} height={2} fill="rgba(140,185,215,0.1)" rx={1} />

      {/* Trees */}
      <g fill="rgba(3,7,14,0.97)">
        {TREES.map((t, i) => <PineTree key={i} cx={t.cx} h={t.h} />)}
      </g>
    </svg>
  )
}
