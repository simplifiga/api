import express from 'express'
import responseError from '../../utils/errors.js'
const router = express.Router()

router.get('/', (req, res) => {
  res.send('Get all data from user with a key:' + req.headers.authorization)
})

router.post('/', (req, res) => {
  const { url, nick } = req.body
  if (!url) return responseError(res, 420)
  res.json({
    id: nick ?? 'randomId',
    shortened: `https://simplifi.ga/${nick ?? 'randomId'}`,
    target: url,
  })
})

router.delete('/:id', (req, res) => {
  res.json({
    deleted: true,
    id: req.params.id,
  })
})

const v1 = { router, methods: 'GET POST DELETE' }
export default v1
