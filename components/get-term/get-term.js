import xs from 'xstream'
import {div, h3, input, button, p, textarea} from '@cycle/dom'

function render (sources) {
  const requestClick$ = sources.DOM.select('button.get-term-button').events('click')
  const ws$ = sources.SocketIO.filter(function (msg) {
    return msg.msgType === 'term'
  })

  return xs.combine(requestClick$, ws$)
    .startWith([{target: {value: ''}}, {message: {name: '', value: ''}}])
    .map(arr =>
      {
        const term = arr[1].message
        return div('.container.get-term-container', [
          h3('get a term'),
          input('.get-term-name'),
          button('.get-term-button', 'get a term'),
          div('.value-field', [
            div('.label', 'value'),
            textarea({attrs: {
              'class': 'value get-term-value',
              'cols': 80,
              'rows': 24
            }}, term.value)
          ])
        ])
      }
    )
}

function getTerm (sources) {
  const requestClick$ = sources.DOM.select('button.get-term-button').events('click')
  const name$ = sources.DOM.select('input.get-term-name').events('input')
  const vtree$ = render(sources)
  let name

  const sendRequest$ = xs.merge(requestClick$, name$)
    .map(e => {
      if (e.target.className === 'get-term-name') {
        name = e.target.value
      }
      return e
    })
    .filter(function (e) {
      return e.target.className === 'get-term-button'
    })
    .map(eventData => ({
      messageType: 'get',
      message: name
    }))

  const sinks = {
    SocketIO: xs.merge(sendRequest$),
    DOM: vtree$
  }

  return sinks
}

export default getTerm
