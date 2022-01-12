import { searchElementById } from '../database/functions.js'

export function generateId({ length, current }) {
  if (current) return validateId({ id: current })

  return new Promise((resolve, reject) => {
    function gen(n) {
      const id = Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, '')
        .substr(0, length)

      validateId({ id }).then(
        resolve,
        () => {
          if (n >= 20) throw Error('id gen error')
          gen(n++)
        },
        reject
      )
    }
    gen(0)
  })
}

export function validateId({ id }) {
  return new Promise((resolve, reject) => {
    searchElementById({ id }).then((data) => {
      if (data === null) return resolve({ validId: id })
      reject(new Error('invalid Id'))
    })
  })
}
