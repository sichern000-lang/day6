import { useId } from 'react'

// 수묵화 느낌의 산 능선 배경 — 상세 페이지 상단과 본문 카드 모서리에 깔림
export default function MountainWash({ className = '' }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg className={`wash ${className}`} viewBox="0 0 800 420" preserveAspectRatio="xMaxYMin meet" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fa384" stopOpacity=".8" />
          <stop offset=".75" stopColor="#a9b89c" stopOpacity=".35" />
          <stop offset="1" stopColor="#c9d3bd" stopOpacity="0" />
        </linearGradient>
        <pattern id={`${id}-h`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(32)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#5f7552" strokeOpacity=".2" strokeWidth="1" />
        </pattern>
        <filter id={`${id}-rough`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="9" />
        </filter>
        <filter id={`${id}-mist`}><feGaussianBlur stdDeviation="14" /></filter>
      </defs>
      <g filter={`url(#${id}-rough)`}>
        <path d="M180 210 C260 160 330 126 400 140 C470 104 540 62 620 72 C700 56 760 42 800 32 V420 H180Z" fill={`url(#${id}-g)`} opacity=".45" />
        <path d="M180 210 C260 160 330 126 400 140 C470 104 540 62 620 72 C700 56 760 42 800 32 V420 H180Z" fill={`url(#${id}-h)`} opacity=".5" />
        <path d="M340 270 C430 206 500 176 580 154 C650 122 720 92 800 72 V420 H340Z" fill={`url(#${id}-g)`} opacity=".65" />
        <path d="M340 270 C430 206 500 176 580 154 C650 122 720 92 800 72 V420 H340Z" fill={`url(#${id}-h)`} opacity=".6" />
        <path d="M500 340 C570 276 650 232 720 204 C760 188 790 174 800 164 V420 H500Z" fill={`url(#${id}-g)`} />
        <path d="M500 340 C570 276 650 232 720 204 C760 188 790 174 800 164 V420 H500Z" fill={`url(#${id}-h)`} opacity=".7" />
      </g>
      <g fill="#f6f9f5" opacity=".85" filter={`url(#${id}-mist)`}>
        <ellipse cx="520" cy="190" rx="130" ry="20" />
        <ellipse cx="690" cy="150" rx="110" ry="16" />
        <ellipse cx="600" cy="285" rx="150" ry="22" />
      </g>
    </svg>
  )
}
