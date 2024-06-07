// from the geocoding API playground

import { renderToStaticMarkup } from 'react-dom/server'
import Icon from '@mapbox/mr-ui/icon'

const renderControlIcon = (iconName) => {
  return (
    <Icon
      size={24}
      name={iconName}
      passthroughProps={{ style: { marginTop: 2, marginLeft: 2 } }}
    />
  )
}

export default class MapboxGLButtonControl {
  constructor({
    title,
    eventHandler,
    className = '',
    icon = null,
    iconAlt = null
  }) {
    this._className = className
    this._title = title
    this._eventHandler = eventHandler
    this._icon = icon
    this._iconAlt = iconAlt
    this._toggleState = true
  }

  onAdd(map) {
    this._btn = document.createElement('button')
    this._btn.className = this._className
    this._btn.type = 'button'
    this._btn.title = this._title
    this._btn.ariaLabel = this._title
    this._btn.onclick = () => {
      this.toggleState()
      this._eventHandler()
    }

    this._span = document.createElement('span')
    this._span.className = 'mapboxgl-ctrl-icon'
    this._span.ariaHidden = 'true'

    if (this._icon) {
      this._span.innerHTML = `${renderToStaticMarkup(
        renderControlIcon(this._icon)
      )}`
    }

    this._btn.appendChild(this._span)

    this._map = map
    this._container = document.createElement('div')
    this._container.className = 'mapboxgl-ctrl-group mapboxgl-ctrl'
    this._container.appendChild(this._btn)

    return this._container
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container)
    this._map = undefined
  }

  toggleState() {
    this._toggleState = !this._toggleState
    if (!this._toggleState && this._iconAlt) {
      this._container.classList.add('bg-gray-deep', 'color-white')
      this._span.innerHTML = `${renderToStaticMarkup(
        renderControlIcon(this._iconAlt)
      )}`
    } else if (this._toggleState && this._icon) {
      this._container.classList.remove('bg-gray-deep', 'color-white')
      this._span.innerHTML = `${renderToStaticMarkup(
        renderControlIcon(this._icon)
      )}`
    }
  }
}
