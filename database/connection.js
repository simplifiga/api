import { MongoClient } from 'mongodb'

import dotenv from 'dotenv'
dotenv.config()

let cachedDb = null

let cachedClient = null

const mongoConnect = process.env.MONGO_URI

export class Connection {
  static async open() {
    try {
      console.info('> DB: Opening a connection')
      this.current = await MongoClient.connect(mongoConnect, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })

      this.db = this.current.db('simplifiga')

      this.collections()
      return this.cache()
    } catch {
      return console.info('> DB: connection error')
    }
  }

  static async check() {
    return cachedDb && cachedClient ? this.recycle() : this.open()
  }

  static cache() {
    cachedDb = this.db
    cachedClient = this.current
    return this
  }

  static recycle() {
    this.current = cachedClient
    this.db = cachedDb
    return this
  }

  static collections() {
    this.links = this.current.db('simplifiga').collection('links')
    this.clients = this.current.db('simplifiga').collection('clients')
    this.reset = this.current.db('simplifiga').collection('reset')
  }
}

process.on('SIGINT', () => {
  Connection.close()
  process.exit(0)
})
