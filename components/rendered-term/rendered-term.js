import xs from 'xstream'
import {h1, div, button} from '@cycle/dom'
import renderPart from './render-part.js'

function render (sources) {
  const gotRender$ = sources.SocketIO.filter(function (msg) {
    return msg.msgType === 'render'
  })

  const putSuccess$ = sources.SocketIO.filter(function (msg) {
    return msg.msgType === 'putsuccess'
  })

  const viewRender$ = xs.merge(gotRender$, putSuccess$)
    .map(msg => {
      return div('.container.rendered-term-container', [
        div({attrs: {
          'class': 'markdown-body',
          'id': 'markdown-target'
        }}, [
          h1('.term-name', msg.message.name),
          div('.button-div', [
            button('.get-all-terms', 'see all terms'),
            button('.edit-this-term-button', 'edit this')
          ])
        ].concat(msg.message.value.map(renderPart)))
      ])
    })

  return viewRender$
}

function renderedTerm (sources) {
  const gotRender$ = sources.SocketIO.filter(function (msg) {
    return msg.msgType === 'render'
  })

  const putSuccess$ = sources.SocketIO.filter(function (msg) {
    return msg.msgType === 'putsuccess'
  })

  const requestEditClick$ = sources.DOM.select('button.edit-this-term-button').events('click')

  const requestEdit$ = xs.merge(gotRender$, putSuccess$)
    .map(msg => {
      return requestEditClick$.map(function (e) {
        return [msg, e]
      })
    })
    .flatten()
    .map(arr => {
      return {
        messageType: 'edit',
        message: arr[0].message.name
      }
    })

  const linkClicked$ = sources.DOM.select('button.link').events('click')
    .map(e => {
      return {
        messageType: 'render',
        message: e.target.dataset.term
      }
    })

  return {
    SocketIO: xs.merge(requestEdit$, linkClicked$),
    DOM: render(sources),
  }
}

export default renderedTerm
