import xs from 'xstream'
import {div, span, h3, input, button, p, textarea} from '@cycle/dom'

function render (sources) {
  const edit$ = sources.SocketIO.filter(function (msg) {
    return msg.msgType === 'edit'
  })

  const new$ = sources.DOM.select('button.add-new-term').events('click')

  const undefinedClicked$ = sources.DOM.select('button.undefined').events('click')
    .map(e => {
      return {
        messageType: 'edit',
        message: {
          name: e.target.dataset.term,
          value: ''
        }
      }
    })

  return xs.merge(
      edit$,
      new$,
      undefinedClicked$
    )
    .map(msg => {
      return div('.container.put-term-container', [
        button('.get-all-terms', 'see all terms'),
        h3((msg.message ? 'edit ' : 'add ') + (msg.message ? msg.message.name : 'a term')),
        div('.name-field', [
          div('.label'),
          !msg.message ? input({
            attrs: {
              'class': 'value put-term-name'
            }
          }) : ''
        ]),
        div('.value-field', [
          div('.label'),
          textarea({
            attrs: {
              'class': 'value put-term-value',
              'cols': 80,
              'rows': 24
            }
          }, [msg.message ? msg.message.value : ''])
        ]),
        button('.put-term-button', 'save'),
        msg.message ? button({
          attrs: {
            'class': 'cancel-put-term-button',
            'data-term': msg.message.name
          }
        }, 'cancel') : null
      ])
    })
}

function putTerm (sources) {
  const requestClick$ = sources.DOM.select('button.put-term-button').events('click')
  const socketName$ = sources.SocketIO.filter(function (msg) {
    return msg.msgType === 'edit'
  }).map(msg => msg.message.name)
  const socketValue$ = sources.SocketIO.filter(function (msg) {
    return msg.msgType === 'edit'
  }).map(msg => msg.message.value)
  const formName$ = sources.DOM.select('input.put-term-name').events('input')
    .map(msg => msg.target.value)
  const formValue$ = sources.DOM.select('textarea.put-term-value').events('input')
    .map(msg => msg.target.value)
  const unknownName$ = sources.DOM.select('button.undefined').events('click')
    .map(e => e.target.dataset.term)
  const unknownValue$ = sources.DOM.select('button.undefined').events('click')
    .map(e => '')
  const vtree$ = render(sources)

  const name$ = xs.merge(socketName$, formName$, unknownName$)
  const value$ = xs.merge(socketValue$, formValue$, unknownValue$)

  const sendRequestPut$ = xs.combine(name$, value$)
    .map(arr => {
      return requestClick$.map(function (e) {
        return arr.concat(e)
      })
    })
    .flatten()
    .map(arr => ({
      messageType: 'put',
      message: {
        name: arr[0],
        value: arr[1]
      }
    }))

  const cancelEdit$ = sources.DOM.select('button.cancel-put-term-button').events('click')
    .map(e => {
      return {
        messageType: 'render',
        message: e.target.dataset.term
      }
    })

  const sinks = {
    SocketIO: xs.merge(sendRequestPut$, cancelEdit$),
    DOM: vtree$
  }

  return sinks
}

export default putTerm
