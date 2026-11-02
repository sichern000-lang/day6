import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import IslandMap from '../components/IslandMap'
import StoryCard from '../components/StoryCard'
import { STORIES } from '../lib/stories'

export default function MapPage() {
  // 지도에서 고른 핀은 이 페이지 안에서만 필요 → 지역 상태
  const [selected, setSelected] = useState(STORIES[0])
  return (
    <>
      <PageHeader title="신화 지도" subtitle="핀을 눌러 이야기를 만나 보세요 (위치는 대략적인 표시예요)" />
      <div className="panel map-wrap">
        <IslandMap selectedId={selected.id} onSelect={setSelected} />
      </div>
      <h2 className="section-title">선택한 이야기</h2>
      <div className="one"><StoryCard story={selected} showSummary /></div>
    </>
  )
}
