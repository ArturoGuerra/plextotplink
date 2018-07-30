const express = require('express');
const multer = require('multer');
const morgan = require('morgan');
const http = require('http');

const app = new express();
const httpServer = http.createServer(app)
const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 3000
const socket = process.env.SOCKET || null
const path = process.env.HTTP_PATH || '/'

const upload = multer({ dest: "/tmp/" });

app.set('port', port)
app.set('host', host)
app.set('socket', socket)

let config = {}
config.dev = !(process.env.NODE_ENV === 'production')

if (!config.dev) {
  app.set('trust proxy', true)
}

app.use(morgan('short'))

app.post(path, upload.single('thumb'), require('./plex'))

// Listening on
httpServer.on('listening', onListening)
function onListening () {
  let msg
  if (socket) {
    msg = `[unix socket] Listening on ${socket}`
  } else {
    let address = this.address().family === 'IPv4' ? this.address().address : `[${this.address().address}]`
    let name = this.address().family === 'IPv4' ? 'ipv4server' : 'ipv6server'
    msg = `[${name}]` + ' Listening on http://' + `${address}:${this.address().port}` // eslint-disable-line no-console
  }
  console.log(msg)
}

function StartServer () {
  if (socket) {
    if (fs.existsSync(socket)) {
      fs.unlinkSync(socket)
    }
    httpServer.listen(socket, () => {
      fs.chmodSync(socket, '0777')
    })
  } else {
    httpServer.listen(port, host)
  }
}

StartServer()
