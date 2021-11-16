export default function responseError(res, errorCode) {
  return res
    .status(errorCode)
    .json({ errorCode, message: 'Error message here' })
}
