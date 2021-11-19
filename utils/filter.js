export function filterObjParams(obj, params) {
  return params.split(', ').reduce((a, key) => ({ ...a, [key]: obj[key] }), {})
}

export function filterArrByLength(arr, length) {
  return arr.filter((p) => p.length === length)
}
