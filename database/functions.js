import { ArrayToObj } from '../utils/converter.js'
import { Connection } from './connection.js'

Connection.open()

export function createUrlBridge({ id, url, origin }) {
  return new Promise((resolve, reject) => {
    Connection.links
      .insertOne({
        id: id,
        target: url,
        origin: origin,
        references: [],
        locations: [],
        clicks: 0,
      })
      .then(resolve, reject)
  })
}

export function retrieveUrlData({ id, origin }) {
  return new Promise((resolve, reject) => {
    Connection.links.findOne({ id, origin }).then(resolve, reject)
  })
}

export function searchElementById({ id }) {
  return new Promise((resolve, reject) => {
    Connection.links.findOne({ id }).then(resolve, reject)
  })
}

export function retrieveAllUrlData({ origin }) {
  return new Promise((resolve, reject) => {
    Connection.links.find({ origin }).toArray().then(resolve, reject)
  })
}

export function retrieveAllUrlDataWithFilter({ origin, filter }) {
  return new Promise((resolve, reject) => {
    Connection.links
      .find({ origin, ...filter })
      .toArray()
      .then(resolve, reject)
  })
}

export function updateUrlBridge({ id, origin, props }) {
  return new Promise((resolve, reject) => {
    Connection.links
      .updateOne(
        { id, origin },
        {
          $set: ArrayToObj(props),
        }
      )
      .then(resolve, reject)
  })
}

export function deleteUrlBridge({ id, origin }) {
  return new Promise((resolve, reject) => {
    Connection.links.deleteOne({ id, origin }).then(resolve, reject)
  })
}

export function validateToken({ token }) {
  return new Promise((resolve, reject) => {
    Connection.clients.findOne({ token }).then(resolve, reject)
  })
}
