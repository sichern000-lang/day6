// 이야기 종류별 단순 도형 그림 (카드 썸네일)
const TONE = { 창조신화: 'sage', 건국신화: 'blue', 지형전설: 'butter', 마을전설: 'clay', 당신화: 'moss' }
export const toneOf = (kind) => TONE[kind] ?? 'sage'

export default function KindArt({ kind }) {
  return (
    <svg viewBox="0 0 120 120" className="kind-art" aria-hidden="true">
      {kind === '창조신화' && <><path d="M10 96 L52 30 L72 60 L84 44 L110 96Z" /><circle cx="86" cy="26" r="9" /></>}
      {kind === '건국신화' && <><circle cx="30" cy="70" r="14" /><circle cx="60" cy="50" r="14" /><circle cx="90" cy="70" r="14" /><path d="M10 100 H110" /></>}
      {kind === '지형전설' && <><path d="M18 100 L34 52 L56 70 L74 28 L102 100Z" /><path d="M10 100 H110" /></>}
      {kind === '마을전설' && <><path d="M14 100 V70 C14 30 106 30 106 70 V100Z" /><path d="M42 100 V76 C42 56 78 56 78 76 V100" className="cut" /></>}
      {kind === '당신화' && <><circle cx="60" cy="44" r="26" /><path d="M60 70 V104" /><path d="M36 104 H84" /></>}
    </svg>
  )
}
