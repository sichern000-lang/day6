import { STORIES, MAP_H, MAP_W, project } from '../lib/stories'

// 제주도를 단순화한 SVG 지도 — 핀을 누르면 onSelect(story)
// 위치는 대략적인 표시이며 정확한 좌표가 아닙니다.
export default function IslandMap({ selectedId, onSelect }) {
  return (
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="island-map" role="img" aria-label="제주 신화 지도">
      <ellipse cx={MAP_W / 2 - 10} cy={MAP_H / 2 + 6} rx={MAP_W * 0.46} ry={MAP_H * 0.34} className="land" />
      {STORIES.map((s) => {
        const { x, y } = project(s.lat, s.lng)
        const on = s.id === selectedId
        return (
          <g key={s.id} className={`pin ${on ? 'on' : ''}`} transform={`translate(${x} ${y})`}
            tabIndex={0} role="button" aria-label={s.title}
            onClick={() => onSelect(s)} onKeyDown={(e) => e.key === 'Enter' && onSelect(s)}>
            <circle r={on ? 11 : 8} />
            <text y={s.labelDy ?? -16} textAnchor="middle">{s.title}</text>
          </g>
        )
      })}
    </svg>
  )
}
