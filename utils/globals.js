import { searchElementById, searchElementsById } from '../database/functions.js'
import { readFile } from 'fs/promises'

export function mapInvalidDocuments(array) {
  return array.map((reference, index) => {
    if (!reference || !reference.url)
      return {
        error: 'MISSING-PARAMETERS',
        index,
      }
    return reference
  })
}

export function mapRepeatedDocs(array) {
  return array.map((reference, index, all) => {
    if (reference.error || !reference.id) return reference

    return all.filter((elem) => elem.id === reference.id).length !== 1
      ? {
          error: 'REPEATED-DOCUMENT',
          index,
        }
      : reference
  })
}

export function generateManyIds({ length, ids }) {
  let randomNamesInTime = []

  function generatePromise({ processedIds, index, id }) {
    return new Promise((resolve) => {
      if (id) return resolve(id)
      if (processedIds[index]) return resolve(processedIds[index])
      genRandomId([...ids, ...processedIds, ...randomNamesInTime], length).then(
        async (value) => {
          resolve(value)
        }
      )
    })
  }

  return new Promise((resolve) => {
    async function gen(n, processed) {
      randomNamesInTime.splice(0, randomNamesInTime.length)
      const processedIds = processed.map((p) => (p && p.error && p.id) || p)

      const PromiseList = []
      const AllCurrentPromises = ids.map((id, index) => {
        return function () {
          return new Promise((resolve) => {
            generatePromise({
              processedIds,
              index,
              id,
            }).then((value) => {
              randomNamesInTime.push(value)
              resolve(value)
            })
          })
        }
      })

      for (const asyncFn of AllCurrentPromises) {
        const result = await asyncFn()
        PromiseList.push(result)
      }

      const currentList = PromiseList.filter(
        (_id, index) => !processedIds[index]
      )

      const validation = await validateManyIds({ ids: currentList })

      const onlyGen = validation
        .filter((checked) => !ids.includes(checked.id ?? checked))
        .map((f) => f.id)

      const onyGenInvalid = validation
        .filter((checked) => checked.error && onlyGen.includes(checked.id))
        .map(({ id }) => id)

      if (n >= 10) {
        resolve(
          PromiseList.map((id, index) => {
            if (processed[index]) return processed[index]

            const currentValid = validation.filter((v) => v === id)[0]
            if (currentValid) return currentValid
            return {
              error: 'SERVER-ERROR',
              id,
            }
          })
        )
      }

      if (onyGenInvalid.length !== 0) {
        const nextTryCount = n + 1
        return gen(
          nextTryCount,
          PromiseList.map((id, index) => {
            if (processed[index]) return processed[index] // Se foi processado antes
            if (onyGenInvalid.includes(id)) return null

            const validationThis = validation.filter((v) => v?.id === id)

            if (validationThis.length !== 0) return validationThis[0]

            return id
          })
        )
      }

      resolve(
        PromiseList.map((id, index) => {
          if (processed[index]) return processed[index]

          return validation.filter((v) => {
            if (v.error) return v.id === id
            return v === id
          })[0]
        })
      )
    }
    gen(0, [])
  })
}

export async function validateManyIds({ ids }) {
  const blocked = JSON.parse(await readFile('./blocked.json'))

  const blockedIds = ids.filter((id) => blocked.ids.includes(id))
  const nonBlockedIds = ids.filter((id) => !blockedIds.includes(id))

  const searchedLists = await searchElementsById({ ids: nonBlockedIds })

  return ids.map((id) => {
    if (blockedIds.includes(id)) return { error: 'BLOCKED', id }
    if (searchedLists.includes(id)) return { error: 'INVALID', id }
    return id
  })
}

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
        .substring(0, length)

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

async function genRandomId(excludeList, length) {
  return new Promise((resolve) => {
    const gen = (times) => {
      const random = Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, '')
        .substring(0, length)

      if (excludeList.includes(random)) {
        const next = times + 1
        if (times < 100) {
          return setTimeout(() => {
            gen(next)
          }, 1)
        }
        resolve({ error: 'GENERATION-ERROR' })
      }

      resolve(random)
    }

    gen(0)
  })
}
