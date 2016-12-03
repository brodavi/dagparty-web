import io from 'socket.io-client'
import xs from 'xstream'

function makeSocketIODriver(server, token) {
  const sock = io(server)

  function sockDriver(outgoing$) {
    outgoing$.addListener({
      next: outgoing => {
        // console.log('outgoing ws: ',outgoing)
        sock.emit(outgoing.messageType, outgoing.message)
      },
      error: () => {},
      complete: () => {}
    })

    return xs.create({
      start: listener => {
        sock.on('msg', function (x) {
          console.log('got ws msg: ', x)
          listener.next({
            msgType: x.msgType,
            message: x.data
          })
        })
      },
      stop: () => {},
    })
  }

  return sockDriver
}

export default makeSocketIODriver
