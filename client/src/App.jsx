import { useEffect, useState } from 'react'
import api from './api'

export default function App() {
  const [movies, setMovies] = useState([])
  const [name, setName] = useState('')
  const [rating, setRating] = useState('')
  const [time, setTime] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const res = await api.getAllMovies()
      setMovies(res.data.data)
      setError('')
    } catch {
      setError('Could not reach the API')
    }
  }

  useEffect(() => { load() }, [])

  const add = async (e) => {
    e.preventDefault()
    try {
      await api.insertMovie({
        name,
        rating: Number(rating),
        time: time.split(',').map((t) => t.trim()).filter(Boolean),
      })
      setName(''); setRating(''); setTime('')
      load()
    } catch {
      setError('Could not save the movie')
    }
  }

  const edit = async (m) => {
    const r = window.prompt('New rating', m.rating)
    if (r === null) return
    await api.updateMovieById(m._id, { name: m.name, rating: Number(r), time: m.time })
    load()
  }

  const remove = async (id) => {
    await api.deleteMovieById(id)
    load()
  }

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Movies</h1>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <form onSubmit={add} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input required type="number" step="0.1" min="0" max="10" placeholder="Rating" value={rating} onChange={(e) => setRating(e.target.value)} />
        <input required placeholder="Times (comma separated)" value={time} onChange={(e) => setTime(e.target.value)} />
        <button type="submit">Add</button>
      </form>
      <ul>
        {movies.map((m) => (
          <li key={m._id} style={{ margin: '8px 0' }}>
            <strong>{m.name}</strong> — {m.rating} — {m.time.join(', ')}{' '}
            <button onClick={() => edit(m)}>Edit rating</button>{' '}
            <button onClick={() => remove(m._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
