import { Link } from 'react-router-dom'
import { useT } from '../lib/useT'

export default function NotFound() {
  const t = useT()
  return (
    <main className="container">
      <div className="hero-lite">
        <h1>{t('nf.title')}</h1>
        <p>{t('nf.text')}</p>
        <Link className="btn" to="/">{t('nf.home')}</Link>
      </div>
    </main>
  )
}
