import { searchElementById } from '../database/functions.js'
import { readFile } from 'fs/promises'

export function generateId({ length, current }) {
  if (current)
    return validateId({
      id: current
        .split('')
        .filter((k) => k !== ' ')
        .join(''),
    })

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

export async function validateId({ id }) {
  const blocked = JSON.parse(await readFile('./blocked.json'))
  return new Promise((resolve, reject) => {
    if (blocked.ids.includes(id)) reject(new Error('blocked'))
    searchElementById({ id }).then((data) => {
      if (data === null) return resolve({ validId: id })
      reject(new Error('invalid'))
    })
  })
}
