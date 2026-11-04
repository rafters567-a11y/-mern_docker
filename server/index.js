const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()
app.use(cors())
app.use(express.json())

const Movie = mongoose.model(
  'Movie',
  new mongoose.Schema(
    {
      name: { type: String, required: true },
      time: { type: [String], required: true },
      rating: { type: Number, required: true },
    },
    { timestamps: true }
  )
)

const wrap = (fn) => (req, res) =>
  fn(req, res).catch((err) => res.status(400).json({ success: false, error: err.message }))

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.post('/api/movie', wrap(async (req, res) => {
  const movie = await Movie.create(req.body)
  res.status(201).json({ success: true, id: movie._id, message: 'Movie created' })
}))

app.get('/api/movies', wrap(async (req, res) => {
  const data = await Movie.find().sort({ createdAt: -1 })
  res.json({ success: true, data })
}))

app.get('/api/movie/:id', wrap(async (req, res) => {
  const data = await Movie.findById(req.params.id)
  if (!data) return res.status(404).json({ success: false, error: 'Movie not found' })
  res.json({ success: true, data })
}))

app.put('/api/movie/:id', wrap(async (req, res) => {
  const data = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!data) return res.status(404).json({ success: false, error: 'Movie not found' })
  res.json({ success: true, data })
}))

app.delete('/api/movie/:id', wrap(async (req, res) => {
  const data = await Movie.findByIdAndDelete(req.params.id)
  if (!data) return res.status(404).json({ success: false, error: 'Movie not found' })
  res.json({ success: true, data })
}))

const PORT = process.env.PORT || 5000
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo:27017/movies'

mongoose
  .connect(MONGO_URL)
  .then(() => app.listen(PORT, () => console.log(`API listening on ${PORT}`)))
  .catch((err) => {
    console.error('Mongo connection failed:', err.message)
    process.exit(1)
  })
