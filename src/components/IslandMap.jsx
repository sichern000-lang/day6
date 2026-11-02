import { STORIES, MAP_H, MAP_W, localize, project } from '../lib/stories'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../lib/useT'

// 제주도를 단순화한 SVG 지도 — 핀을 누르면 onSelect(story)
// 위치는 대략적인 표시이며 정확한 좌표가 아닙니다.
export default function IslandMap({ selectedId, onSelect }) {
  const lang = useAppStore((s) => s.lang)
  const t = useT()
  return (
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="island-map" role="img" aria-label={t('map.title')}>
      <ellipse cx={MAP_W / 2 - 10} cy={MAP_H / 2 + 6} rx={MAP_W * 0.46} ry={MAP_H * 0.34} className="land" />
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
    </svg>
  )
}
