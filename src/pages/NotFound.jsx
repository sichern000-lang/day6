import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="container">
      <div className="hero-lite">
        <h1>길을 잃었어요</h1>
        <p>없는 주소예요. 홈에서 다시 출발해 보세요.</p>
        <Link className="btn" to="/">홈으로</Link>
      </div>
    </main>
  )
}
