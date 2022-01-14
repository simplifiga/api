import http from 'http'
import express from 'express'
import routes from './routes.js'
import responseError from '../utils/errors.js'

import dotenv from 'dotenv'
import { Connection } from '../database/connection.js'
import crypto from './crypto.js'
import override from './override.js'
import { validateToken } from '../database/functions.js'

dotenv.config()

const router = express()

router.use('*', override.router)
router.use('*', crypto.router)

router.use(async (_req, res, next) => {
  const conn = await Connection.check()
  if (conn?.db && conn?.current) {
    return next()
  }

  responseError(res, 500)
})

router.use(async (req, res, next) => {
  const authorization = req.headers.authorization

  if (!authorization) return responseError(res, 401)
  validateToken({ token: authorization }).then(
    (data) => {
      if (data === null) return responseError(res, 401)
      console.log('NEW REQUEST: ' + authorization)
      next()
    },
    () => responseError(res, 500)
  )
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
