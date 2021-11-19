import express from 'express'
import responseError from '../../utils/errors.js'

import { filterArrByLength, filterObjParams } from '../../utils/filter.js'

import {
  createUrlBridge,
  deleteUrlBridge,
  retrieveAllUrlDataWithFilter,
  retrieveAllUrlData,
  retrieveUrlData,
  updateUrlBridge,
} from '../../database/functions.js'

import { ArrayToObj } from '../../utils/converter.js'

const router = express.Router()

router.get('/', async (req, res) => {
  const origin = req.headers.authorization
  await retrieveAllUrlData({ origin })
    .then((data) =>
      res.json(
        data.map((d) =>
          filterObjParams(d, 'id, target, references, locations, clicks')
        )
      )
    )
    .catch((err) => console.info(err) && responseError(res, 500))
})

router.get('/:id', async (req, res) => {
  const origin = req.headers.authorization
  const id = req.params.id

  await retrieveUrlData({ id, origin })
    .then((data) =>
      res.json(
        filterObjParams(data, 'id, target, references, locations, clicks')
      )
    )
    .catch(() => responseError(res, 500))
})

router.get('/filter/:props', async (req, res) => {
  const origin = req.headers.authorization
  const props = req.params.props
    .split('&')
    .map((param) => {
      const key = param.split('=')[0]
      const value = param.split('=')[1]
      if (key && value) return [key, value]
      return 'delete'
    })
    .filter((p) => p !== 'delete')

  const filteredProps = props.filter((prop) =>
    ['country', 'countryCode'].includes(prop[0])
  )

  const acceptedProps = ArrayToObj(
    filteredProps.map((prop) => {
      const propDbName = {
        country: 'locations.country',
        countryCode: 'locations.code',
      }
      return [propDbName[prop[0]], prop[1]]
    })
  )

  await retrieveAllUrlDataWithFilter({ origin, filter: acceptedProps })
    .then((data) => {
      res.json(
        data.map((d) => filterObjParams(d, 'id, target, references, clicks'))
      )
    })
    .catch(() => responseError(523))
})

router.post('/', async (req, res) => {
  const origin = req.headers.authorization
  const { url, id } = req.body

  if (!url) return responseError(res, 420)

  await createUrlBridge({ id, url, origin })
    .then(() =>
      res.json({ id, target: url, shortcut: `https://simplifi.ga/${id}` })
    )
    .catch(() => responseError(res, 500))
})

router.delete('/:id', async (req, res) => {
  const origin = req.headers.authorization
  const id = req.params.id

  await deleteUrlBridge({ id, origin })
    .then(({ deletedCount }) => res.json({ id, deleted: !!deletedCount }))
    .catch(() => responseError(res, 500))
})

router.patch('/:id', async (req, res) => {
  const origin = req.headers.authorization
  const id = req.params.id
  const props = req.body.props

  if (!props || props.length === 0) return responseError(res, 401)

  const validProps = filterArrByLength(
    props.filter((params) => ['id', 'target'].includes(params[0])),
    2
  )

  console.info(validProps)
  if (validProps.length === 0) return responseError(res, 402)

  await updateUrlBridge({ origin, id, props: validProps })
    .then(({ acknowledged, matchedCount }) => {
      const ackData = validProps
      const unkData = props.filter(
        (n) => !validProps.map((p) => p[0]).includes(n[0])
      )

      const dataResponse = {
        applied: matchedCount === 1,
        acknowledged: (acknowledged && ackData.length !== 0 && ackData) || null,
        uncknowledged:
          (acknowledged && unkData.length !== 0 && unkData) || null,
      }

      Object.keys(dataResponse).forEach((r) => {
        dataResponse[r] === null && delete dataResponse[r]
      })

      res.json(dataResponse)
    })
    .catch((err) => console.info(err) && responseError(res, 500))
})

const v1 = { router, methods: 'GET POST DELETE' }
export default v1
