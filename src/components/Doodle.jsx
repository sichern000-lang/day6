import { useId, useMemo } from 'react'
import { rng } from '../lib/rng'

// 제주 신화·민담·전설의 작은 낙서 일러스트 — 연필(검정)과 색연필(포인트 색) 느낌의 SVG.
// 그림은 코드로 그린 것이라 크기를 키워도 선이 깨지지 않음. 선이 살짝 일렁이고 종이 결에 군데군데 끊김.
export const DOODLES = ['oreum', 'giant', 'holes', 'peak', 'dragon', 'serpent', 'tree', 'hareubang', 'haenyeo', 'horse', 'tangerine', 'camellia', 'fire']

export const f = (n) => n.toFixed(1)
export const Q = (x1, y1, x2, y2, b = 0) => `M${f(x1)} ${f(y1)} Q${f((x1 + x2) / 2 + b)} ${f((y1 + y2) / 2 - b)} ${f(x2)} ${f(y2)}`
// 색연필 빗금: 영역 안을 비스듬한 짧은 선으로 채움
export const hatch = (r, x0, y0, x1, y1, step = 7, len = 12, tilt = 0.5) => {
  const out = []
  for (let x = x0; x <= x1; x += step) for (let y = y0; y <= y1; y += len * 0.9) {
    if (r() < 0.12) continue
    const jx = (r() - 0.5) * 3, jy = (r() - 0.5) * 4
    out.push(Q(x + jx, y + jy, x - len * tilt + jx, y + len + jy, 1))
  }
  return out
}
// 일정한 줄무늬(산등성이 결)
export const ridge = (r, fnY, x0, x1, step = 9, len = 20) => {
  const out = []
  for (let x = x0; x <= x1; x += step) {
    const y = fnY(x)
    out.push(Q(x, y + 4, x - len * 0.5, y + len, 2 + r() * 2))
  }
  return out
}
export const P = ({ d, c, className, fill = 'none' }) => <path d={d} className={c ?? className} fill={fill} />

export const ART = {
  // 오름 — 빗금 친 언덕과 작은 나무들
  oreum(r) {
    const hillA = (x) => 112 - 40 * Math.sin(((x - 10) / 180) * Math.PI) * (0.9 + 0.1 * Math.cos(x / 20))
    const hillB = (x) => 150 - 26 * Math.sin(((x - 50) / 150) * Math.PI)
    return (
      <>
        <P d="M8 118 C44 74 104 66 138 80 C162 90 180 100 194 106" />
        {ridge(r, hillA, 24, 168, 10, 22).map((d, i) => <P key={'a' + i} d={d} />)}
        <P d="M52 168 C90 130 140 128 190 142" />
        {ridge(r, hillB, 70, 180, 11, 14).map((d, i) => <P key={'b' + i} d={d} />)}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <ellipse key={'t' + i} cx={16 + i * 11 + r() * 3} cy={150 + (i % 2) * 8 + r() * 4} rx="4" ry="8" className="fill" />)}
        {[0, 1, 2, 3, 4].map((i) => <ellipse key={'u' + i} cx={96 + i * 12} cy={176 + (i % 2) * 4} rx="4.5" ry="8" className="fill" />)}
        <ellipse cx="152" cy="64" rx="7" ry="11" className="fill" /><ellipse cx="164" cy="62" rx="7" ry="12" className="fill" /><ellipse cx="174" cy="68" rx="6" ry="10" className="fill" />
        <P d="M148 80 L148 90 M170 80 L170 90" />
      </>
    )
  },
  // 설문대할망 — 오름 너머로 고개를 내민 거인
  giant(r) {
    return (
      <>
        <path d="M84 96 C74 66 100 46 128 56 C150 64 152 94 138 110 C128 120 112 118 104 108 Z" className="fill" />
        <path d="M106 108 C102 122 96 134 86 142 M122 112 C128 126 140 136 156 140" fill="none" />
        <P d="M100 92 C96 100 94 106 98 110" c="paper-stroke" />
        <P d="M104 96 q5 4 9 0" c="paper-stroke" />
        <P d="M150 96 C170 84 184 80 192 84 M192 84 l-8 -6 M192 84 l-9 2 M192 84 l-6 8" />
        <P d="M10 170 C28 140 62 140 84 168" /><P d="M58 176 C84 142 128 140 150 172" /><P d="M120 178 C146 150 176 150 194 174" />
        {hatch(r, 22, 152, 76, 172, 8, 10).map((d, i) => <P key={i} d={d} c="c-green" />)}
        {hatch(r, 120, 156, 186, 176, 8, 10).map((d, i) => <P key={'g' + i} d={d} c="c-green" />)}
        {[0, 1, 2].map((i) => <ellipse key={'t' + i} cx={34 + i * 9} cy={150 - (i % 2) * 3} rx="3.5" ry="7" className="fill" />)}
      </>
    )
  },
  // 삼성혈 — 세 구멍에서 솟는 세 사람
  holes(r) {
    return (
      <>
        <P d="M10 150 C60 144 140 156 192 148" />
        {[0, 1, 2].map((i) => {
          const x = 46 + i * 54
          return (
            <g key={i}>
              <ellipse cx={x} cy={152} rx="19" ry="7" className="fill" />
              <circle cx={x} cy={112 - i * 4} r="8" fill="none" />
              <P d={`M${x} ${120 - i * 4} V146 M${x} ${128 - i * 4} L${x - 14} ${116 - i * 4} M${x} ${128 - i * 4} L${x + 14} ${116 - i * 4}`} />
              <P d={`M${x - 8} ${100 - i * 4} q4 -8 8 -2`} c="c-orange" />
            </g>
          )
        })}
        {hatch(r, 14, 158, 190, 188, 9, 11).map((d, i) => <P key={i} d={d} c="c-green" />)}
        {[0, 1, 2, 3].map((i) => <P key={'s' + i} d={`M${30 + i * 44} 70 l4 -10 l4 10 M${34 + i * 44} 50 v-6`} c="c-yellow" />)}
      </>
    )
  },
  // 산방산 — 한라산 봉우리가 날아와 앉은 모습과 화살
  peak(r) {
    const slope = (x) => 70 + Math.abs(x - 118) * 0.9
    return (
      <>
        <P d="M72 134 C80 90 100 56 118 44 C136 56 158 92 164 134 Z" />
        {ridge(r, slope, 86, 152, 9, 22).map((d, i) => <P key={i} d={d} />)}
        <P d="M20 102 h32 M10 114 h40 M26 126 h26" />
        <P d="M10 176 C60 170 80 176 100 182 C120 188 150 176 192 172" />
        <P d="M88 176 q12 14 24 8" />
        <P d="M30 168 L150 158" /><P d="M150 158 l-14 -6 M150 158 l-12 8" />
        <P d="M30 168 l-8 -8 M30 168 l-10 4 M40 167 l-8 -8 M40 167 l-10 4" c="c-red" />
        <circle cx="168" cy="52" r="6" fill="none" className="c-yellow" />
      </>
    )
  },
  // 용두암 — 바다에서 솟은 용 머리 바위와 옥구슬
  dragon(r) {
    return (
      <>
        <P d="M44 156 C42 112 58 80 90 72 C118 66 148 76 160 100 L148 110 C140 104 128 104 120 112 L108 132 L98 156" />
        <circle cx="108" cy="88" r="5" fill="none" /><circle cx="109" cy="88" r="1.8" className="fill" />
        <P d="M88 72 C84 56 90 48 100 44 M104 68 C106 52 114 46 122 46" />
        <P d="M148 106 C170 104 184 96 190 84 M142 112 C166 118 180 126 190 124" />
        {hatch(r, 58, 100, 96, 150, 8, 11, 0.4).map((d, i) => <P key={i} d={d} c="c-green" />)}
        <P d="M10 168 q12 -10 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" /><P d="M0 184 q12 -10 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" c="c-blue" />
        <circle cx="166" cy="42" r="12" fill="none" className="c-blue" /><P d="M160 38 q4 -5 9 -3" />
        <P d="M166 20 v-6 M184 42 h8 M148 42 h-8 M178 28 l5 -5" className="c-yellow" />
      </>
    )
  },
  // 김녕굴 — 동굴 입구와 똬리 튼 큰 뱀
  serpent(r) {
    return (
      <>
        <path d="M24 176 C20 110 56 62 100 62 C144 62 182 108 176 176 Z" fill="none" />
        <path d="M44 176 C44 130 68 92 100 92 C132 92 158 130 156 176 Z" className="fill soft" />
        <path d="M58 170 C84 168 116 150 92 134 C68 118 120 112 126 130 C132 148 104 150 110 158" fill="none" className="snake" />
        <path d="M110 158 C114 164 124 164 128 158 C130 150 122 148 118 152" fill="none" className="snake" />
        <circle cx="123" cy="156" r="1.6" className="paper-fill" /><P d="M128 160 l8 2 M136 162 l4 -3 M136 162 l4 4" c="c-red" />
        {hatch(r, 14, 100, 40, 170, 7, 12, 0.3).map((d, i) => <P key={i} d={d} />)}
        {hatch(r, 164, 106, 188, 170, 7, 12, 0.3).map((d, i) => <P key={'r' + i} d={d} />)}
        <P d="M10 178 h180" />
      </>
    )
  },
  // 송당 당나무 — 큰 나무와 매달린 종이 띠, 그 아래 앉은 사람
  tree(r) {
    return (
      <>
        <path d="M44 100 C34 80 54 62 72 66 C74 46 104 40 118 52 C134 38 168 50 164 74 C186 76 190 102 168 108 C170 126 140 128 130 118 C120 130 84 128 80 114 C60 122 36 114 44 100 Z" fill="none" />
        {[0, 1, 2, 3, 4].map((i) => <P key={i} d={Q(66 + i * 22, 78 + (i % 2) * 8, 80 + i * 22, 74 + (i % 2) * 8, 3)} />)}
        <P d="M100 124 C98 140 94 156 88 170 M122 124 C124 140 130 156 138 170 M100 150 C108 154 116 154 124 150" />
        <P d="M82 176 h62" />
        {[0, 1, 2, 3].map((i) => <P key={'rb' + i} d={`M${60 + i * 28} ${100 + (i % 2) * 6} v${28 + i * 3}`} c={i % 2 ? 'c-red' : 'c-yellow'} />)}
        <circle cx="154" cy="164" r="5" fill="none" /><P d="M154 169 v10 l-9 5 M154 174 l8 -4" />
        <P d="M150 182 h22" />
        {hatch(r, 20, 160, 72, 190, 8, 11).map((d, i) => <P key={'g' + i} d={d} c="c-green" />)}
      </>
    )
  },
  // 돌하르방 — 모자 쓰고 배 위에 손을 모은 돌 할아버지
  hareubang(r) {
    return (
      <>
        <P d="M70 64 C70 34 130 34 130 64 C146 66 150 76 136 80 H64 C50 76 54 66 70 64 Z" />
        <path d="M70 80 C66 100 76 116 100 116 C124 116 134 100 130 80" fill="none" />
        <circle cx="88" cy="92" r="5" fill="none" /><circle cx="112" cy="92" r="5" fill="none" />
        <circle cx="88" cy="92" r="1.8" className="fill" /><circle cx="112" cy="92" r="1.8" className="fill" />
        <P d="M100 92 C96 102 96 104 102 104 M90 110 q10 4 20 0" />
        <P d="M76 116 C72 140 70 160 68 182 H132 C130 160 128 140 124 116" />
        <P d="M84 138 C94 146 108 146 118 138 M92 150 C98 156 106 156 112 150" />
        <P d="M58 188 H142" />
        {hatch(r, 70, 120, 128, 178, 7, 11, 0.4).map((d, i) => <P key={i} d={d} c="c-grey" />)}
        {hatch(r, 76, 40, 126, 60, 8, 9, 0.4).map((d, i) => <P key={'h' + i} d={d} c="c-grey" />)}
      </>
    )
  },
  // 해녀 — 바다 위 테왁(둥근 부표)과 물안경 쓴 얼굴
  haenyeo(r) {
    return (
      <>
        <circle cx="132" cy="92" r="26" fill="none" />
        <P d="M108 92 q24 18 48 0 M116 76 q16 -8 32 0 M120 108 q12 6 24 0" c="c-orange" />
        {hatch(r, 112, 72, 152, 108, 6, 9, 0.5).map((d, i) => <P key={i} d={d} c="c-orange" />)}
        <circle cx="66" cy="96" r="18" fill="none" />
        <path d="M48 90 C50 74 82 74 84 90 C80 82 52 82 48 90 Z" className="fill" />
        <circle cx="60" cy="98" r="5" fill="none" /><circle cx="73" cy="98" r="5" fill="none" /><P d="M65 98 h3" />
        <P d="M66 114 v6 M84 104 C98 100 108 94 118 92" />
        <P d="M10 130 q12 -12 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" /><P d="M0 150 q12 -12 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" c="c-blue" /><P d="M10 170 q12 -12 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" c="c-blue" />
        {[0, 1, 2].map((i) => <circle key={'b' + i} cx={40 + i * 8} cy={72 - i * 12} r={2 + i} fill="none" className="c-blue" />)}
      </>
    )
  },
  // 제주 조랑말 — 몸통이 굵고 다리가 짧은 작은 말, 갈기가 휘날림
  horse() {
    return (
      <>
        <P d="M150 78 C130 70 108 72 92 74 C84 62 76 48 66 40 L64 30 L70 36 C58 40 46 54 38 66 C34 72 38 78 46 76 C54 72 62 68 68 66 C72 78 78 90 84 96" />
        <P d="M84 96 C96 106 124 108 136 98" />
        <P d="M150 78 C160 90 160 104 153 118 L153 140 M136 98 C141 110 141 124 139 140" />
        <P d="M84 96 L82 140 M97 102 L99 140" />
        <P d="M78 142 h9 M94 142 h9 M134 142 h9 M148 142 h9" />
        <P d="M150 78 C165 82 173 100 169 120 C168 126 165 130 162 133" />
        <circle cx="51" cy="63" r="2" className="fill" />
        <P d="M44 74 q4 3 8 1" />
        {[0, 1, 2, 3, 4].map((i) => <P key={i} d={Q(70 + i * 5.5, 42 + i * 7, 60 + i * 5.5, 60 + i * 7, 2)} c="c-orange" />)}
        <P d="M66 40 C60 36 58 34 56 32" c="c-orange" />
        <P d="M20 144 h170" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <P key={'g' + i} d={`M${24 + i * 26} 144 q-3 -10 -8 -12 M${30 + i * 26} 144 q2 -12 6 -14`} c="c-green" />)}
      </>
    )
  },
  // 수첩 — 스프링 수첩, 줄, 연필, 작은 하트
  notebook() {
    return (
      <>
        <P d="M54 44 C54 40 58 38 62 38 H140 C144 38 148 40 148 44 V160 C148 164 144 166 140 166 H62 C58 166 54 164 54 160 Z" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <P key={i} d={`M46 ${52 + i * 16} h16`} />)}
        {[0, 1, 2, 3, 4].map((i) => <P key={'l' + i} d={`M78 ${76 + i * 16} h56`} />)}
        <P d="M84 58 h34" />
        <P d="M150 140 L186 96 L196 104 L160 150 L146 156 Z M180 102 l10 8" />
        <P d="M118 116 C110 108 104 112 106 118 C108 124 118 130 118 130 C118 130 128 124 130 118 C132 112 126 108 118 116 Z" c="c-red" />
      </>
    )
  },
  // 귤 — 눈을 감은 귤 (색연필 주황)
  tangerine(r) {
    return (
      <>
        <path d="M100 62 C150 56 170 100 150 138 C134 168 66 168 50 138 C32 100 54 56 100 62 Z" fill="none" />
        {hatch(r, 58, 80, 148, 150, 6, 12, 0.5).map((d, i) => <P key={i} d={d} c="c-orange" />)}
        <P d="M80 112 q8 6 16 0 M110 112 q8 6 16 0" /><P d="M96 128 q8 6 16 0" c="c-red" />
        <P d="M100 62 C98 50 102 42 110 38 M104 56 C124 40 142 48 144 60 C128 66 112 62 104 56" c="c-green" />
        <P d="M120 30 l4 -10 M136 34 l10 -6" c="c-yellow" />
      </>
    )
  },
  // 동백꽃 — 겨울 제주의 붉은 동백
  camellia(r) {
    return (
      <>
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2 - Math.PI / 2
          const cx = 100 + Math.cos(a) * 28, cy = 84 + Math.sin(a) * 28
          return <circle key={i} cx={cx} cy={cy} r="22" fill="none" />
        })}
        {hatch(r, 70, 54, 130, 112, 6, 10, 0.4).map((d, i) => <P key={i} d={d} c="c-red" />)}
        <circle cx="100" cy="84" r="8" fill="none" className="c-yellow" />
        {[0, 1, 2, 3, 4, 5].map((i) => <circle key={'d' + i} cx={92 + (i % 3) * 8} cy={78 + Math.floor(i / 3) * 10} r="1.6" className="fill" />)}
        <P d="M100 118 C100 140 96 160 90 178" />
        <P d="M96 146 C70 136 56 150 52 164 C74 168 90 160 96 146 M100 140 C124 126 146 138 150 152 C128 158 108 154 100 140" c="c-green" />
      </>
    )
  },
  // 도체빗불 — 들판 위에 떠다니는 도깨비불
  fire(r) {
    const flame = (x, y, s) => `M${x} ${y} C${x - 14 * s} ${y - 14 * s} ${x - 6 * s} ${y - 30 * s} ${x} ${y - 46 * s} C${x + 6 * s} ${y - 30 * s} ${x + 14 * s} ${y - 14 * s} ${x} ${y} Z`
    return (
      <>
        <P d={flame(62, 112, 1)} /><P d={flame(112, 84, 1.3)} /><P d={flame(152, 124, 0.8)} />
        {[[62, 112, 1], [112, 84, 1.3], [152, 124, 0.8]].map(([x, y, s], i) => (
          <P key={i} d={`M${x} ${y - 6 * s} C${x - 5 * s} ${y - 14 * s} ${x - 2 * s} ${y - 22 * s} ${x} ${y - 30 * s}`} c="c-blue" />
        ))}
        {hatch(r, 52, 80, 74, 112, 5, 9, 0.2).map((d, i) => <P key={'a' + i} d={d} c="c-blue" />)}
        <P d="M10 160 C60 150 140 168 192 156" />
        {hatch(r, 14, 166, 190, 188, 8, 10).map((d, i) => <P key={'g' + i} d={d} c="c-green" />)}
        <P d="M30 60 l3 -8 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 z" c="c-yellow" />
      </>
    )
  },
}

// 종이 조각의 윤곽 — 그림마다 "그림이 차지하는 덩어리"를 단순한 모양으로 정의해 두고,
// 그 모양을 부풀려서(dilate) 오린 종이로 씀. 그림 안쪽의 빈 곳도 종이로 채워져 스티커처럼 오려 낸 모양이 됨.
const BODY = {
  oreum: <><path d="M8 118 C44 74 104 66 138 80 C162 90 180 100 194 106 V188 H10Z" /><path d="M140 48 H186 V92 H140Z" /></>,
  giant: <><circle cx="112" cy="80" r="34" /><path d="M8 178 C28 140 62 140 84 168 L100 192 H8Z M56 180 C84 142 128 140 150 172 V192 H56Z M118 182 C144 150 176 150 196 176 V192 H118Z" /><path d="M138 88 H196 V106 H138Z" /></>,
  holes: <><path d="M8 144 C60 138 140 150 194 142 V190 H8Z" /><path d="M24 88 H176 V150 H24Z" /><path d="M24 56 H176 V74 H24Z" /></>,
  peak: <><path d="M70 138 C80 90 100 54 118 40 C136 54 158 92 166 138Z" /><path d="M8 96 H56 V132 H8Z" /><path d="M8 148 C60 146 100 190 194 170 V192 H8Z" /></>,
  dragon: <><path d="M42 162 C40 110 58 76 90 68 C120 62 150 74 164 98 L192 82 V128 L160 116 L100 162Z" /><path d="M0 164 H200 V190 H0Z" /><circle cx="166" cy="42" r="17" /></>,
  serpent: <path d="M20 184 C16 108 56 58 100 58 C144 58 184 106 180 184Z" />,
  tree: <><path d="M40 100 C30 74 52 56 72 62 C76 40 106 34 120 48 C136 32 172 46 168 74 C192 76 194 108 170 112 C172 132 140 134 130 124 C120 136 82 134 78 118 C58 126 32 118 40 100Z" /><path d="M82 118 H140 V182 H82Z" /><path d="M140 150 H174 V192 H140Z" /><path d="M20 160 H72 V190 H20Z" /></>,
  hareubang: <path d="M54 62 C54 30 146 30 146 62 C160 66 164 80 150 84 L132 118 L138 192 H62 L68 118 L50 84 C36 80 40 66 54 62Z" />,
  haenyeo: <><circle cx="132" cy="92" r="30" /><circle cx="66" cy="96" r="22" /><path d="M82 90 H112 V108 H82Z" /><path d="M0 124 H200 V190 H0Z" /></>,
  horse: <path d="M34 62 L70 28 L104 74 H150 C166 84 174 106 171 134 L164 150 H76 V100 L40 84Z" />,
  mine: <path d="M26 34 H174 V170 H26Z" />,
  notebook: <><path d="M44 34 H150 V170 H44Z" /><path d="M148 92 L192 90 L200 106 L158 160Z" /></>,
  tangerine: <><path d="M100 62 C150 56 170 100 150 138 C134 168 66 168 50 138 C32 100 54 56 100 62Z" /><path d="M96 24 H152 V68 H96Z" /></>,
  camellia: <><circle cx="100" cy="84" r="56" /><path d="M90 118 H110 V182 H90Z" /><path d="M46 138 H154 V172 H46Z" /></>,
  fire: <><ellipse cx="62" cy="92" rx="18" ry="32" /><ellipse cx="112" cy="62" rx="22" ry="42" /><ellipse cx="152" cy="104" rx="15" ry="26" /><path d="M8 148 C60 142 140 160 194 150 V190 H8Z" /><circle cx="36" cy="58" r="12" /></>,
}

// variant: DOODLES 중 하나. 같은 variant 는 항상 같은 그림 (seed 로 빗금 위치만 달라짐)
// cut: true 면 그림 윤곽을 따라 오린 종이 조각(그림자 포함) 위에 그림이 올라감. paper: 종이 색
export default function Doodle({ variant, seed = variant, className = '', cut = false, paper = '#f1f5f1', d }) {
  const id = useId().replace(/:/g, '')
  const r = useMemo(() => rng(`${variant}-${seed}`), [variant, seed])
  const art = useMemo(() => (d ? <path d={d} /> : (ART[variant] ?? ART.oreum)(r)), [variant, r, d])
  return (
    <svg className={`doodle ${cut ? 'cutout' : ''} ${className}`} viewBox={cut ? '-18 -18 236 236' : '0 0 200 200'} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        {/* 선이 살짝 일렁이고, 종이 결 때문에 군데군데 끊기는 연필·색연필 질감 */}
        <filter id={`${id}-p`} x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="5" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="2.6" result="rough" />
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3.4 0 0 0 -0.55" result="mask" />
          <feComposite in="rough" in2="mask" operator="in" />
        </filter>
        {/* 오린 종이: 몸통 모양을 부풀리고 → 가장자리를 손으로 자른 듯 일렁이게 → 종이색·종이결·그림자 */}
        {cut && (
          <filter id={`${id}-cut`} filterUnits="userSpaceOnUse" x="-18" y="-18" width="236" height="236" colorInterpolationFilters="sRGB">
            <feMorphology in="SourceAlpha" operator="dilate" radius="9" result="grow" />
            <feGaussianBlur in="grow" stdDeviation="4" result="soft" />
            <feComponentTransfer in="soft" result="edge"><feFuncA type="linear" slope="14" intercept="-6" /></feComponentTransfer>
            <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="3" result="wob" />
            <feDisplacementMap in="edge" in2="wob" scale="6" result="shape" />
            <feFlood floodColor={paper} result="color" />
            <feComposite in="color" in2="shape" operator="in" result="sheet" />
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="6" result="fiber" />
            <feColorMatrix in="fiber" type="matrix" values="0 0 0 0 .42  0 0 0 0 .34  0 0 0 0 .2  0 0 0 .24 0" result="grain" />
            <feComposite in="grain" in2="shape" operator="in" result="grainIn" />
            <feMerge result="paperTex"><feMergeNode in="sheet" /><feMergeNode in="grainIn" /></feMerge>
            <feDropShadow in="paperTex" dx="0" dy="3.5" stdDeviation="3.2" floodColor="#243a2e" floodOpacity="0.34" />
          </filter>
        )}
      </defs>
      {cut && <g filter={`url(#${id}-cut)`} fill="#000" stroke="none">{BODY[variant] ?? BODY.oreum}</g>}
      <g filter={`url(#${id}-p)`} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">{art}</g>
    </svg>
  )
}
