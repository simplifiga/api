import express from 'express'
import expressContentTypeOverride from 'express-content-type-override'
import routes from './routes.js'
import cors from 'cors'

const router = express()

const corsOptions = {
  origin: '*',
  methods: routes.v1.methods,
  optionsSuccessStatus: 200,
}

router.use('*', expressContentTypeOverride({ contentType: 'application/json' }))
router.use(express.json({ type: 'application/json' }))
router.use(express.urlencoded({ extended: true }))
router.use(cors(corsOptions))

router.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', `${routes.v1.methods},OPTIONS`)
  res.setHeader(
    'Access-Control-Allow-Headers',
    'x-api-key, Authorization, Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers'
  )

  if (req.method === 'OPTIONS') {
    res.setHeader(
      'Access-Control-Allow-Methods',
      `${routes.v1.methods},OPTIONS`
    )
    return res.status(200).json({
      methods: routes.v1.methods,
    })
  }
  next()
})

const override = { router, methods: '' }
export default override
