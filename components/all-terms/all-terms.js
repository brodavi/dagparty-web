import xs from 'xstream'
import {div, h3, button, p} from '@cycle/dom'

function renderTerms (terms) {
  if (terms[0].name !== '') {
    return terms.map(function (term) {
      return div([
        button({attrs: {'class': 'render-term-button', 'data-term': term.name}}, term.name),
        div('.term-value', [term.value])
      ])
    })
  } else {
    return ''
  }
}

function render (sources) {
  let terms = []

  const gotTerms$ = sources.SocketIO.filter(function (msg) {
    return msg.msgType === 'terms'
  })

  const gotUpdateTerms$ = sources.SocketIO.filter(function (msg) {
    return msg.msgType === 'updateterms'
  })

  xs.merge(gotTerms$, gotUpdateTerms$)
    .addListener({
      next: i => {
        terms = i.message
      },
      error: err => console.error(err),
      complete: () => console.log('completed'),
    })

  return gotTerms$
    .map(msg => {
      const terms = msg.message
      return div('.container.get-all-terms-container', [
        div('.all-terms', renderTerms(terms)),
        button('.add-new-term', '+')
      ])
    })
}

function getAllTerms (sources) {
  const getAllClick$ = sources.DOM.select('button.get-all-terms').events('click')
  const vtree$ = render(sources)

  const getAllRequest$ = xs.combine(getAllClick$)
    .map(eventData => ({
      messageType: 'getAll'
    }))

  const renderRequest$ = sources.DOM.select('button.render-term-button').events('click')
    .map(e => ({
      messageType: 'render',
      message: e.target.dataset.term
    }))

  const sinks = {
    SocketIO: xs.merge(getAllRequest$, renderRequest$),
    DOM: vtree$
  }

  return sinks
}

export default getAllTerms
