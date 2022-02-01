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
  updateUsageCounter,
  getUpgradedStatus,
} from '../../database/functions.js'

import { ArrayToObj, convertUrlToQRcode } from '../../utils/converter.js'

import Response from '../../utils/response.js'
import { generateId } from '../../utils/globals.js'

import requestIp from 'request-ip'

// CONFIG //
const config = {
  idLength: 5,
}
// CONFIG //

const router = express.Router()

router.get('/', async (req, res) => {
  // Get all data by user
  const origin = req.headers.authorization
  await retrieveAllUrlData({ origin })
    .then((data) => {
      Response(
        req,
        res,
        data.map((d) =>
          filterObjParams(d, 'id, target, references, locations, clicks')
        )
      )
    })
    .catch((err) => console.info(err) && responseError(res, 500))
})

router.get('/qrcode/:id', async (req, res) => {
  const origin = req.headers.authorization
  const id = req.params.id
  let upgraded = res.locals.upgraded

  await getUpgradedStatus({ origin }).then(
    (status) => {
      upgraded = status
    },
    () => {
      return responseError(res, 402)
    }
  )
  if (upgraded !== 'COMPLETED') return responseError(res, 403)

  await retrieveUrlData({ id, origin })
    .then((data) => {
      if (!data) return responseError(res, 510)
      convertUrlToQRcode({ url: data.target }).then(
        (qrStream) => {
          if (!qrStream) return responseError(res, 500)
          res.setHeader('content-type', 'image/png')
          qrStream.pipe(res)
        },
        () => {
          responseError(res, 500)
        }
      )
    })
    .catch((_error) => responseError(res, 500))
})

router.get('/:id', async (req, res) => {
  // Get all data by id
  const origin = req.headers.authorization
  const id = req.params.id

  await retrieveUrlData({ id, origin })
    .then((data) => {
      if (!data) return responseError(res, 510)
      Response(
        req,
        res,
        filterObjParams(data, 'id, target, references, locations, clicks')
      )
    })
    .catch((_error) => responseError(res, 500))
})

router.get('/filter/:props', async (req, res) => {
  // Get all data with filter
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
      if (!data) return responseError(res, 510)
      Response(
        req,
        res,
        data.map((d) => filterObjParams(d, 'id, target, references, clicks'))
      )
    })
    .catch(() => responseError(500))
})

router.post('/', async (req, res) => {
  if (req.body.length) {
    return responseError(res, 503, 'Bulk link shortening is under maintenance.')
  }

  const origin = req.headers.authorization
  const ip = requestIp.getClientIp(req)
  const { url, id } = req.body

  if (!url) return responseError(res, 400)

  generateId({ length: config.idLength, current: id }).then(
    ({ validId }) => {
      createUrlBridge({ id: validId, url, origin })
        .then(() => {
          Response(req, res, {
            id: validId,
            target: url,
            shortcut: `https://simplifi.ga/${validId}`,
          })
          updateUsageCounter({ ip, origin })
        })
        .catch(() => responseError(res, 500))
    },
    (error) => {
      switch (error.message) {
        case 'blocked':
          responseError(res, 406)
          break
        case 'invalid':
          responseError(res, 409)
      }
    }
  )
})

router.delete('/:id', async (req, res) => {
  // Delete by id
  const origin = req.headers.authorization
  const id = req.params.id

  await deleteUrlBridge({ id, origin })
    .then(({ deletedCount }) =>
      Response(req, res, { id, deleted: !!deletedCount })
    )
    .catch(() => responseError(res, 500))
})

router.patch('/:id', async (req, res) => {
  //  Update bridge by id
  const origin = req.headers.authorization
  const id = req.params.id
  const props = req.body.props

  if (!props || props.length === 0) return responseError(res, 400)

  const validProps = filterArrByLength(
    props.filter((params) => ['id', 'target'].includes(params[0])),
    2
  )

  if (validProps.length === 0) return responseError(res, 403)

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

      Response(req, res, dataResponse)
    })
    .catch((err) => console.info(err) && responseError(res, 500))
})

const v1 = { router, methods: 'GET,POST,DELETE' }
export default v1
