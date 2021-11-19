import http from 'http'
import express from 'express'
import routes from './routes.js'
import contentTypeOverride from 'express-content-type-override'
import responseError from '../utils/errors.js'

import dotenv from 'dotenv'
import { Connection } from '../database/connection.js'
dotenv.config()

const router = express()

router.use('*', contentTypeOverride({ contentType: 'application/json' }))
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

router.use(async (_req, res, next) => {
  const conn = await Connection.check()
  if (conn?.db && conn?.current) {
    return next()
  }

  responseError(res, 500)
})

router.use(async (req, res, next) => {
  // TODO: Ativar verificação de token
  const authorization = req.headers.authorization
  if (authorization) return responseError(res, 401)
  if (authorization === 'valid-auth') return responseError(res, 401)
  next()
})

router.use('/', routes.v1.router)

Object.keys(routes).forEach((version) => {
  router.use(`/${version}`, routes[version].router)
})

router.use((_req, res) => {
  return responseError(res, 404)
})

const httpServer = http.createServer(router)
const PORT = process.env.PORT ?? 6060
httpServer.listen(PORT, () =>
  console.log(`The server is running on port ${PORT}`)
)
