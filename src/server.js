import http from 'http'
import express from 'express'
import routes from './routes.js'

const router = express()

router.use(express.json())

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'origin, X-Requested-With, Content-Type, Accept, Authorization'
  )
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', routes.v1.methods)
    return res.status(200).json({})
  }
  next()
})

router.use('/', routes.v1.router)

router.use(express.static('public'))

router.use((_req, res) => {
  const error = new Error('function not found')
  return res.status(404).json({
    message: error.message,
  })
})

const httpServer = http.createServer(router)
const PORT = process.env.PORT ?? 3000
httpServer.listen(PORT, () =>
  console.log(`The server is running on port ${PORT}`)
)
