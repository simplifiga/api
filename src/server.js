import http from 'http'
import express from 'express'
import routes from './routes.js'
import responseError from '../utils/errors.js'

import dotenv from 'dotenv'
import { Connection } from '../database/connection.js'
import crypto from './crypto.js'
import override from './override.js'
import {
  getUpgradedStatus,
  getUsageMetrics,
  validateToken,
} from '../database/functions.js'
import requestIp from 'request-ip'

dotenv.config()

const router = express()

router.use('*', override.router)
router.use('/', crypto.router)

// Connect database
router.use(async (_req, res, next) => {
  const conn = await Connection.check()
  if (conn?.db && conn?.current) {
    return next()
  }

  responseError(res, 500)
})

// Authorization token validation
router.use((req, res, next) => {
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

// metrics < 100 or premium user
router.post(async (req, res, next) => {
  const origin = req.headers.authorization
  const ip = requestIp.getClientIp(req)

  await getUsageMetrics({ origin, ip })?.then(
    (data) => {
      data.requests >= 100
        ? getUpgradedStatus({ origin }).then(
            (status) => {
              if (status !== 'COMPLETED') return responseError(res, 403)
              res.locals.upgraded = status
              next()
            },
            () => {
              responseError(res, 402)
            }
          )
        : next()
    },
    () => {
      next()
    }
  )

  next()
})

Object.keys(routes).forEach((version) => {
  router.use(`/${version}`, routes[version].router)
})

router.use('/', routes.v1.router)

router.use((_req, res) => {
  return responseError(res, 404)
})

const httpServer = http.createServer(router)
const PORT = process.env.PORT ?? 6060
httpServer.listen(PORT, () =>
  console.log(`The server is running on port ${PORT}`)
)
