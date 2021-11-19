import { Db, MongoClient } from 'mongodb'

import dotenv from 'dotenv'
dotenv.config()

let cachedDb = Db
let cachedClient = MongoClient

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

      return this.cache()
    } catch {
      return console.info('> DB: connection error')
    }
  }

  static async check() {
    return cachedDb instanceof Db && cachedClient instanceof MongoClient
      ? this.recycle()
      : this.open()
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
}

process.on('SIGINT', () => {
  Connection.close()
  process.exit(0)
})
