import { readFile } from 'fs/promises'

let errors = {}

const loadErrors = async () => {
  errors = JSON.parse(await readFile('./errors.json'))
}
loadErrors()

export default function responseError(res, statusCode, message) {
  if (res === null)
    return {
      statusCode,
      message: errors[statusCode] ?? 'Unknown Error',
    }

  const resMessage = message ?? errors[statusCode] ?? 'Unknown Error'
  res.statusMessage = resMessage

  return res.status(statusCode).json({
    statusCode,
    message: resMessage,
    documentation: new URL('https://simplifi.ga/developer#errors'),
  })
}
