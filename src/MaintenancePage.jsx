// 점검 안내 화면 — VITE_MAINTENANCE=1 일 때만 보임 (main.jsx)
export default function Maintenance() {
  return (
    <main className="maint">
      <p className="maint-brand">Jeju Story Archive</p>
      <h1>잠시 점검 중이에요</h1>
      <p>곧 다시 열릴 예정입니다. 조금만 기다려 주세요.</p>
      <p lang="en">We’re closed for a short while. Please come back soon.</p>
    </main>
  )
}
