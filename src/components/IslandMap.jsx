import mapUrl from '../assets/jeju-map.svg'
import { STORIES, MAP_H, MAP_W, localize, project } from '../lib/stories'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

// 제주도를 단순화한 SVG 지도 — 핀을 누르면 onSelect(story)
// 위치는 대략적인 표시이며 정확한 좌표가 아닙니다.
export default function IslandMap({ selectedId, onSelect, places = [], selectedPlaceId, onSelectPlace }) {
  const lang = useAppStore((s) => s.lang)
  const t = useT()
  return (
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="island-map" role="img" aria-label={t('map.title')}>
      <image href={mapUrl} x="0" y="0" width={MAP_W} height={MAP_H} className="land-img" />
      {STORIES.map((s) => {
        const { x, y } = project(s.lat, s.lng)
        const on = s.id === selectedId
        const title = localize(s, lang).title
        return (
          <g key={s.id} className={`pin ${on ? 'on' : ''}`} transform={`translate(${x} ${y})`}
            tabIndex={0} role="button" aria-label={title}
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
            onClick={() => onSelectPlace?.(p)} onKeyDown={(e) => e.key === 'Enter' && onSelectPlace?.(p)}>
            <circle r={on ? 19 : 16} />
            {p.drawing ? <svg x={-12} y={-12} width={24} height={24} viewBox="0 0 200 200" className="pin-art"><path d={p.drawing} fill="none" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" /></svg> : <circle r="3" className="dot" />}
            {on && <text y={32} textAnchor="middle">{p.name}</text>}
          </g>
        )
      })}
    </svg>
  )
}
