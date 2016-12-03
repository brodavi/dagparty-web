import xs from 'xstream'
import {run} from '@cycle/xstream-run'
import {makeDOMDriver, div, h1, button, input, p} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http'
import makeSocketIODriver from './drivers/cycle-socket.js'

import login from './components/login/login.js'

import renderedTerm from './components/rendered-term/rendered-term.js'
import allTerms from './components/all-terms/all-terms.js'
import putTerm from './components/put-term/put-term.js'
import showError from './components/show-error/show-error.js'

function main (sources) {
  const loginSink$ = login(sources)
  const renderedTermSink$ = renderedTerm(sources)
  const allTermsSink$ = allTerms(sources)
  const putTermSink$ = putTerm(sources)
  const errorSink$ = showError(sources)

  const commandSockets$ = xs.merge(
    loginSink$.SocketIO,
    renderedTermSink$.SocketIO,
    allTermsSink$.SocketIO,
    putTermSink$.SocketIO,
  )

  const vtree$ = xs.merge(
    renderedTermSink$.DOM,
    loginSink$.DOM,
    allTermsSink$.DOM,
    putTermSink$.DOM,
    errorSink$.DOM,
  )

  const sinks = {
    SocketIO: commandSockets$,
    DOM: vtree$,
    HTTP: loginSink$.HTTP,
  }

  return sinks
}

const drivers = {
  SocketIO: makeSocketIODriver('localhost:9000'),
  DOM: makeDOMDriver('#app'),
  HTTP: makeHTTPDriver(),
}

run(main, drivers)
