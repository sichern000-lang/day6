// 사진 대신 쓰는 일러스트 풍경 — 나중에 실제 사진으로 바꾸려면 .hero 의 배경 이미지로 교체
export default function Landscape({ variant = 'hero' }) {
  const id = `l-${variant}`
  return (
    <svg className={`landscape ${variant}`} viewBox="0 0 1200 700" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fa8cc" />
          <stop offset=".6" stopColor="#cfd6d2" />
          <stop offset="1" stopColor="#e6e3cf" />
        </linearGradient>
        <filter id={`${id}-blur`} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="16" /></filter>
      </defs>
      <rect width="1200" height="700" fill={`url(#${id}-sky)`} />
      <g fill="#fff" opacity=".75" filter={`url(#${id}-blur)`}>
        <ellipse cx="760" cy="150" rx="230" ry="60" />
        <ellipse cx="640" cy="215" rx="150" ry="40" />
        <ellipse cx="260" cy="190" rx="110" ry="30" />
        <ellipse cx="1000" cy="260" rx="140" ry="30" />
      </g>
      {/* 먼 오름 */}
      <path d="M0 470 C160 440 260 380 380 400 C500 420 560 450 700 430 C820 412 930 360 1050 380 C1130 392 1170 420 1200 430 V700 H0Z" fill="#9db27a" />
      <path d="M0 520 C200 480 330 500 480 480 C650 456 760 470 900 490 C1040 508 1130 480 1200 470 V700 H0Z" fill="#7f9b55" />
      {/* 돌담 */}
      <g fill="#4d5650" opacity=".85">
        {Array.from({ length: 16 }, (_, i) => (
          <ellipse key={i} cx={90 + i * 36} cy={560 + Math.sin(i * 0.7) * 6} rx="15" ry="9" />
        ))}
      </g>
      <path d="M0 590 C220 560 420 600 640 585 C860 570 1020 560 1200 580 V700 H0Z" fill="#5f7a3a" />
      <path d="M0 640 C260 620 520 650 780 636 C960 626 1100 634 1200 640 V700 H0Z" fill="#4c6530" />
    </svg>
  )
}
