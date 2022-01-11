import NodeRSA from 'node-rsa'

class NodeEncoder {
  constructor(id) {
    this.number = Math.round(Math.random() * 1000)
  }

  encrypt(message) {
    try {
      const encoder = new NodeRSA(tools.toUTF(process.env.PUBLIC_KEY))
      return encoder.encrypt(message, 'base64')
    } catch {
      return null
    }
  }

  decrypt(message) {
    try {
      const decoder = new NodeRSA(tools.toUTF(process.env.PRIVATE_KEY))
      return decoder.decrypt(message, 'utf8')
    } catch {
      return null
    }
  }

  encryptWithCustomKey(message, key) {
    try {
      const encoder = new NodeRSA(tools.toUTF(key))
      return encoder.encrypt(message, 'base64')
    } catch {
      return null
    }
  }
}

class ClientRSA {
  constructor({ bits }) {
    this.RSA = new NodeRSA({ b: bits })
  }

  export() {
    return tools.toBase64(this.RSA.exportKey('public'))
  }

  encrypt(message) {
    try {
      return this.RSA.encrypt(message, 'base64')
    } catch {
      return null
    }
  }

  decrypt(message) {
    try {
      return this.RSA.decrypt(message, 'utf8')
    } catch {
      return null
    }
  }
}

class ServerRSA {
  constructor(serverKey) {
    this.number = Math.round(Math.random() * 1000)
    this.RSA = new NodeRSA(tools.toUTF(serverKey))
  }

  encrypt(message) {
    try {
      return this.RSA.encrypt(message, 'base64')
    } catch {
      return null
    }
  }
}

export function clientEncoder(serverKey, callback) {
  console.info('> Init client encoder')
  callback(new ClientRSA({ bits: 1024 }), new ServerRSA(serverKey), tools)
}

export function serverEncoder(callback) {
  callback(new NodeEncoder(), tools)
}

export const tools = {
  toUTF(str) {
    return Buffer.from(str, 'base64').toString('utf8')
  },
  toBase64(str) {
    return Buffer.from(str).toString('base64')
  },
}
