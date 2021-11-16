import http from 'http'
import express, { Express } from 'express'
import routes from './v2/index'

const router: Express = express()

router.use(express.urlencoded({ extended: false }))
router.use(express.json())

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'origin, X-Requested-With,Content-Type,Accept, Authorization'
  )
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET DELETE POST')
    return res.status(200).json({})
  }
  next()
})

router.use('/', routes)

router.use((req, res) => {
  const error = new Error('not found')
  return res.status(404).json({
    message: error.message,
  })
})

const httpServer = http.createServer(router)
const PORT = process.env.PORT ?? 3000
httpServer.listen(PORT, () =>
  console.log(`The server is running on port ${PORT}`)
)
