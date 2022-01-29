/* eslint-disable prefer-promise-reject-errors */
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

export function updateUsageCounter({ origin, ip }) {
  const localhostIp = ['127.0.0.1', '::1', '127.0.0.1', '::ffff:127.0.0.1']
  const tag = origin === process.env.MAIN_APP_TOKEN ? ip : origin
  if (!tag || localhostIp.includes(tag)) return

  return new Promise((resolve, reject) => {
    Connection.usage
      .updateOne({ tag }, { $inc: { requests: 1 } })
      .then(async (data) => {
        if (data.modifiedCount !== 1) {
          return createUsageCounter({
            tag,
          }).then(resolve, reject)
        }
        resolve(data)
      }, reject)
  })
}

export function getUsageMetrics({ origin, ip }) {
  const localhostIp = ['127.0.0.1', '::1', '127.0.0.1', '::ffff:127.0.0.1']
  const tag = origin === process.env.MAIN_APP_TOKEN ? ip : origin
  if (!tag || localhostIp.includes(tag)) return

  return new Promise((resolve, reject) => {
    Connection.usage.findOne({ tag }).then((data) => {
      if (!data) return reject('metrics-not-found')
      resolve(data)
    }, reject)
  })
}

export function createUsageCounter({ tag }) {
  return new Promise((resolve, reject) => {
    const expireAt = new Date()
    expireAt.setDate(expireAt.getDate() + 30)
    Connection.usage.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 })
    Connection.usage
      .insertOne({
        expireAt,
        logEvent: 1,
        logMessage: 'Success!',
        requests: 1,
        tag,
      })
      .then(resolve, reject)
  })
}

export function getUpgradedStatus({ origin }) {
  return new Promise((resolve, reject) => {
    Connection.clients.findOne({ token: origin }).then((user) => {
      if (!user?.orderRef) return reject('order-not-found')
      Connection.payments
        .findOne({ captureId: user.orderRef })
        .then((payment) => {
          if (!payment?.status) return reject('payment-status-not-found')
          resolve(payment.status)
        })
    }, reject)
  })
}
