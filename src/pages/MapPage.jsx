import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import IslandMap from '../components/IslandMap'
import StoryCard from '../components/StoryCard'
import { STORIES } from '../lib/stories'
import { useT } from '../lib/useT'

export default function MapPage() {
  const t = useT()
  // 지도에서 고른 핀은 이 페이지 안에서만 필요 → 지역 상태
  const [selected, setSelected] = useState(STORIES[0])
  return (
    <>
      <PageHeader title="Myth Map" subtitle={t('map.sub')} />
      <div className="panel map-wrap">
        <IslandMap selectedId={selected.id} onSelect={setSelected} />
      </div>
      <h2 className="section-title">{t('map.selected')}</h2>
      <div className="one"><StoryCard story={selected} showSummary /></div>
    </>
  )
}
