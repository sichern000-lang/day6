import { useState } from 'react'
import mapUrl from '../assets/jeju-map.svg'
import { STORIES, MAP_H, MAP_W, localize, project } from '../lib/stories'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

// 제주도를 단순화한 SVG 지도 — 핀을 누르면 onSelect(story)
// 위치는 대략적인 표시이며 정확한 좌표가 아닙니다.
export default function IslandMap({ selectedId, onSelect, places = [], selectedPlaceId, onSelectPlace }) {
  const lang = useAppStore((s) => s.lang)
  const t = useT()
  const [tip, setTip] = useState(null)   // 핀에 마우스를 올리면 뜨는 말풍선 { x, y, name, addr }
  const show = (x, y, name, addr) => () => setTip({ x, y, name, addr })
  const hide = () => setTip(null)
  // 섬이 차지하는 부분만 잘라서 크게 보임 (여백 제거)
  const [vx, vy, vw, vh] = [10, 22, 775, 360]
  return (
    <div className="map-stage">
    <svg viewBox={`${vx} ${vy} ${vw} ${vh}`} className="island-map" role="img" aria-label={t('map.title')}>
      {/* 지도 그림의 선을 진한 세이지 색으로 칠함: 그림의 투명도를 마스크로 써서 색 사각형을 오려 냄 */}
      <mask id="land-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={MAP_W} height={MAP_H} style={{ maskType: 'alpha' }}>
        <image href={mapUrl} x="0" y="0" width={MAP_W} height={MAP_H} />
      </mask>
      <rect x="0" y="0" width={MAP_W} height={MAP_H} className="land-img" mask="url(#land-mask)" />
      {STORIES.map((s) => {
        const { x, y } = project(s.lat, s.lng)
        const on = s.id === selectedId
        const title = localize(s, lang).title
        return (
          <g key={s.id} className={`pin ${on ? 'on' : ''}`} transform={`translate(${x} ${y})`}
            tabIndex={0} role="button" aria-label={title}
            onMouseEnter={show(x, y, title, localize(s, lang).place)} onMouseLeave={hide} onFocus={show(x, y, title, localize(s, lang).place)} onBlur={hide}
            onClick={() => onSelect(s)} onKeyDown={(e) => e.key === 'Enter' && onSelect(s)}>
            <circle r={on ? 11 : 8} />
            <text y={s.labelDy ?? -16} textAnchor="middle">{title}</text>
          </g>
        )
      })}
      {places.filter((p) => p.lat != null && p.lng != null).map((p) => {
        const { x, y } = project(p.lat, p.lng)
        const on = p.id === selectedPlaceId
        return (
          <g key={p.id} className={`pin mine ${on ? 'on' : ''}`} transform={`translate(${x} ${y})`}
            tabIndex={0} role="button" aria-label={p.name}
            onMouseEnter={show(x, y, p.name, p.address)} onMouseLeave={hide} onFocus={show(x, y, p.name, p.address)} onBlur={hide}
            onClick={() => onSelectPlace?.(p)} onKeyDown={(e) => e.key === 'Enter' && onSelectPlace?.(p)}>
            <circle r={on ? 19 : 16} />
            {p.drawing ? <svg x={-12} y={-12} width={24} height={24} viewBox="0 0 200 200" className="pin-art"><path d={p.drawing} fill="none" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" /></svg> : <circle r="3" className="dot" />}
          </g>
        )
      })}
    </svg>
    {tip && (
      <div className={`map-tip ${(tip.x - vx) / vw > 0.82 ? 'edge-r' : (tip.x - vx) / vw < 0.14 ? 'edge-l' : ''}`}
        style={{ left: `${((tip.x - vx) / vw) * 100}%`, top: `${((tip.y - vy) / vh) * 100}%` }} role="tooltip">
        <strong>{tip.name}</strong>
        {tip.addr && <span>{tip.addr}</span>}
      </div>
    )}
    </div>
  )
}
