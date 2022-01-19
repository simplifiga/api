import express from 'express'
import { serverEncoder, tools } from '../utils/encryptor.js'

const router = express.Router()

router.use('*', (req, _res, next) => {
  if (!req.body.encrypted) return next()
  serverEncoder((server) => {
    req.body =
      req.body.encrypted && JSON.parse(server.decrypt(req.body.encrypted))
    next()
  })
})

router.use('/key', (_req, res) => {
  res.send(tools.toUTF(process.env.PUBLIC_KEY))
})

router.use('/key64', (_req, res) => {
  res.send(process.env.PUBLIC_KEY)
})

const crypto = { router, methods: '' }
export default crypto
