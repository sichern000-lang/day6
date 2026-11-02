export default function PageHeader({ title, subtitle, center = false }) {
  return (
    <header className={`page-header ${center ? 'center' : ''}`}>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  )
}
