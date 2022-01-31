import { Db, MongoClient } from 'mongodb'

import dotenv from 'dotenv'
dotenv.config()

const enviroment = process.env.NODE_ENV

let mongoClient = new MongoClient(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

let mongoDb = new Db(mongoClient, 'simplifiga')

export class Connection {
  static async open() {
    try {
      console.info('> DB: Opening a connection')
      this.current = await mongoClient.connect()

      this.db = this.current.db('simplifiga')

      this.collections()
      return this.cache()
    } catch (err) {
      return console.info('> DB: connection error', err)
    }
  }

  static async check() {
    return this.db && this.current ? this.recycle() : this.open()
  }

  static cache() {
    mongoDb = this.db
    mongoClient = this.current
    return this
  }

  static recycle() {
    this.current = mongoClient
    this.db = mongoDb
    return this
  }

  static collections() {
    this.links = this.db.collection(`${enviroment && enviroment + '-'}links`)
    this.clients = this.db.collection(
      `${enviroment && enviroment + '-'}clients`
    )
    this.usage = this.db.collection(`${enviroment && enviroment + '-'}usage`)
    this.payments = this.db.collection(
      `${enviroment && enviroment + '-'}payments`
    )
  }
}

process.on('SIGINT', () => {
  process.exit(0)
})
