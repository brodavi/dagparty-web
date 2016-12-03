import {div, span, p, button, br} from '@cycle/dom'

function renderPart(part) {
  if (part.type === 'string') {
    return span([part.value])
  } else if (part.type === 'number') {
    return span('.number', [part.value])
  } else if (part.type === 'bool') {
    if (part.value === true) {
      return span('.bool-true', [part.value + ''])
    } else if (part.value === false) {
      return span('.bool-false', [part.value + ''])
    }
  } else if (part.type === 'link') {
    return button({
      attrs: {
        'class': 'link',
        'data-term': part.value
      }
    }, [part.value])
  } else if (part.type === 'undefined') {
    return button({
      attrs: {
        'class': 'undefined',
        'data-term': part.value
      }
    }, ['UNDEFINED'])
  } else if (part.type === 'newline') {
    return br()
  }
}

export default renderPart
