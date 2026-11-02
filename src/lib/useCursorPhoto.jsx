import { useState } from 'react'
import { createPortal } from 'react-dom'
import { usePlaceImage } from './placeImage'

const W = 240       // 떠오르는 사진 너비
const H_GUESS = 190 // 가장자리에서 뒤집을지 판단할 때 쓰는 대략적인 높이
const GAP = 18

// 카드 위에 마우스를 올리면 장소 사진이 커서를 따라다니며 떠오름 (썸네일은 그대로)
// 사용: const { handlers, photo } = useCursorPhoto(story, lang)  →  <Link {...handlers}> … </Link>{photo}
export function useCursorPhoto(story, lang) {
  const [hover, setHover] = useState(false)
  const [ready, setReady] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const url = usePlaceImage(story, lang, hover)

  const track = (e) => setPos({ x: e.clientX, y: e.clientY })
  const handlers = {
    onMouseEnter: (e) => { setHover(true); track(e) },
    onMouseMove: track,
    onMouseLeave: () => { setHover(false); setReady(false) },
  }

  // 화면 오른쪽·아래 끝에 가까우면 커서 반대쪽으로 뒤집어서 잘리지 않게
  const left = pos.x + GAP + W > window.innerWidth ? pos.x - GAP - W : pos.x + GAP
  const top = pos.y + GAP + H_GUESS > window.innerHeight ? pos.y - GAP - H_GUESS : pos.y + GAP

  const photo = hover && url
    ? createPortal(
        <img className={`cursor-photo ${ready ? 'on' : ''}`} src={url} alt="" onLoad={() => setReady(true)}
          style={{ left, top, width: W }} />,
        document.body)
    : null
  return { handlers, photo }
}
