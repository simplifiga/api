import { readFile } from 'fs/promises'

let errors = {}

const loadErrors = async () => {
  errors = JSON.parse(await readFile('./errors.json'))
}
loadErrors()

export default function responseError(res, errorCode) {
  return res.status(errorCode).json({
    errorCode,
    message: errors[errorCode] ?? 'Unknown Error',
  })
}
