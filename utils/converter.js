import { PassThrough } from 'stream'
import QRCode from 'qrcode'

export function ArrayToObj(entries) {
  return Object.fromEntries(entries)
}

export async function convertUrlToQRcode({ url }) {
  const qrStream = new PassThrough()
  await QRCode.toFileStream(qrStream, url, {
    type: 'png',
    width: 400,
    errorCorrectionLevel: 'H',
    version: 6,
  })

  return qrStream
}
