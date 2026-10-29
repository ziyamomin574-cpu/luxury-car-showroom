import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60dvh] max-w-2xl flex-col items-center justify-center gap-5 px-4 text-center">
      <p className="label">404</p>
      <h1 className="font-display text-4xl leading-tight sm:text-5xl">This bay is empty</h1>
      <p className="text-sm leading-relaxed text-detail">
        The page you asked for is not part of the showroom. Try the collection or walk back into the hall.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/cars" className="btn btn-primary">View the cars</Link>
        <Link to="/showroom" className="btn">Enter the showroom</Link>
      </div>
    </section>
  )
}
