import { serverEncoder } from './encryptor.js'
import responseError from './errors.js'

export default function Response(req, res, obj) {
  const clientKey = req.headers.cookie
  if (!clientKey) return res.json(obj)

  serverEncoder((server) => {
    const a = server.encryptWithCustomKey(JSON.stringify(obj), clientKey)
    if (!a) return responseError(res, 500)
    res.send(a)
  })
}
