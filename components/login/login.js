import xs from 'xstream'
import {div, h2, button, p, input} from '@cycle/dom'

function render (sources) {
  const error$ = sources.HTTP
    .select('login')
    .map((response$) =>
      response$.replaceError(err => {
        return xs.of(err)
      })
    )
    .flatten()
    .filter(res => {
      return res.status === 401
    })
    .map(res => {
      return div('.container.login-container', [
        h2('login'),
        div('.fields', [
          div('.email-label', 'Email: '),
          input({attrs: {'class': 'email', 'name': 'email', 'type': 'text'}}),
          div('.password-label', 'Password: '),
          input({attrs: {'class': 'password', 'name': 'password', 'type': 'password'}}),
          div('.login-button-container', [
            button('.login', 'Log in')
          ])
        ]),
        div('.error-container', [
          p('ERROR: ' + res.message)
        ])
      ])
    })

    const vtree$ = sources.SocketIO.filter(function (msg) {
      return msg.msgType === 'error' && msg.message.message === 'you are not authorized'
    })
    .startWith('')
    .map(msg => {
      return div('.container.login-container', [
        h2('login'),
        div('.fields', [
          div('.email-label', 'Email: '),
          input({attrs: {'class': 'email', 'name': 'email', 'type': 'text'}}),
          div('.password-label', 'Password: '),
          input({attrs: {'class': 'password', 'name': 'password', 'type': 'password'}}),
          div('.login-button-container', [
            button('.login', 'Log in')
          ])
        ]),
        msg.message ? div('.error-container', [
          p('ERROR: ' + msg.message)
        ]) : ''
      ])
    })

  return xs.merge(vtree$, error$)
}

function login (sources) {
  const loginClick$ = sources.DOM.select('button.login').events('click')
  const loginKeyDown$ = sources.DOM.select('input.password').events('keydown')
    .filter(e => {
      return e.keyCode === 13
    })

  const email$ = sources.DOM.select('input.email').events('input')
  const password$ = sources.DOM.select('input.password').events('input')
  const vtree$ = render(sources)

  const loginPOST$ = xs.combine(email$, password$)
    .map(arr => {
      return xs.merge(loginClick$, loginKeyDown$).map(click => {
        return arr.concat(click)
      })
    })
    .flatten()
    .map(arr => {
      return [
        arr[0].target.value,
        arr[1].target.value
      ]
    })
    .startWith(['demo@dagparty.com', 'demo'])
    .map(arr => {
      const email = arr[0]
      const password = arr[1]

      return {
        url: 'http://localhost:9000/login',
        category: 'login',
        method: 'POST',
        send: {
          email: email,
          password: password
        }
      }
    })

  const login$ = sources.HTTP
    .select('login')
    .map((response$) =>
      response$.replaceError(err => {
        return xs.of(err)
      })
    )
    .flatten()
    .filter(res => {
      return res.statusText === 'OK'
    })
    .map(res => {
      return {
        messageType: 'authenticate',
        message: JSON.parse(res.text).token
      }
    })

  const sinks = {
    SocketIO: login$,
    DOM: vtree$,
    HTTP: loginPOST$
  }

  return sinks
}

export default login
