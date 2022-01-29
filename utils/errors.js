import { readFile } from 'fs/promises'

let errors = {}

const loadErrors = async () => {
  errors = JSON.parse(await readFile('./errors.json'))
}
loadErrors()

export default function responseError(res, statusCode) {
  if (res === null)
    return {
      statusCode,
      message: errors[statusCode] ?? 'Unknown Error',
    }

  return res.status(statusCode).json({
    statusCode,
    message: errors[statusCode] ?? 'Unknown Error',
  })
}
