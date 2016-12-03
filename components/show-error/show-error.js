import xs from 'xstream'
import {div, p} from '@cycle/dom'

function render (sources) {
  return sources.SocketIO
    .filter(function (msg) {
      return msg.msgType === 'error'
    })
    .map(msg => {
      if (msg.msgType === '') {
        return div()
      } else {
        return div('.container.error-container', [
          p('ERROR: ' + msg.message.message + ': ' + msg.message.errors.type.message)
        ])
      }
    })
}

function showError (sources) {
  const vtree$ = render(sources)

  const sinks = {
    DOM: vtree$
  }

  return sinks
}

export default showError
