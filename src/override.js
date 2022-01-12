import express from 'express'
import expressContentTypeOverride from 'express-content-type-override'
import routes from './routes.js'

const router = express()

router.use('*', expressContentTypeOverride({ contentType: 'application/json' }))
router.use(express.json({ type: 'application/json' }))
router.use(express.urlencoded({ extended: true }))

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Content-Type', 'application/json')
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

const override = { router, methods: '' }
export default override
