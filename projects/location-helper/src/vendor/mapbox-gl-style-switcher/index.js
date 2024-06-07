import './style.css'

const DEFAULT_CONTROL_POSITION = 'top-right'

class StyleSwitcherControl {
  constructor(options) {
    this.styles = options?.styles || [
      {
        uri: 'mapbox://styles/mapbox/streets-v12',
        title: 'Streets',
        className: 'style-streets'
      },
      {
        uri: 'mapbox://styles/mapbox/satellite-streets-v11',
        title: 'Satellite with 3D terrain',
        className: 'style-satellite'
      }
    ]

    this.direction = options?.direction || 'vertical'
  }

  onAdd(map) {
    this._map = map

    this._container = document.createElement('div')
    this._container.className = 'mapboxgl-ctrl mapbox-ctrl-styles'

    const currentStyle = map.getStyle().sprite.replace('sprites', 'styles')

    const stylesElement = document.createElement('div')
    stylesElement.className = `styles ${this.direction}`
    // const activeStylesElement = document.createElement('div');
    // activeStylesElement.className = 'styles-current';
    for (const style of this.styles) {
      const styleElement = document.createElement('div')

      const activeClassName = style.uri === currentStyle ? 'active' : ''
      styleElement.className = `style-button ${style.className} ${activeClassName}`
      stylesElement.appendChild(styleElement)

      styleElement.setAttribute('title', style.title)
      styleElement.setAttribute('data-style-uri', style.uri)
      styleElement.setAttribute(
        'style',
        `background-image:url(${style.backgroundImage})`
      )
    }
    this._container.appendChild(stylesElement)

    this.registerDomEvents()
    return this._container
  }

  getDefaultPosition() {
    return DEFAULT_CONTROL_POSITION
  }

  registerDomEvents() {
    for (const buttonEl of this._container.querySelectorAll('.style-button')) {
      buttonEl.addEventListener('click', this.onClickStyleButton.bind(this))
    }
  }

  onClickStyleButton(e) {
    const styleUri = e.target.dataset.styleUri
    this._map.setStyle(styleUri)

    for (const buttonEl of this._container.querySelectorAll('.style-button')) {
      buttonEl.classList.remove('active')
    }

    e.target.classList.add('active')

    // const stylesElement = this._container.querySelector('div.styles');
    // const activeStylesElement = this._container.querySelector('div.styles-current');
    // for (const buttonEl of this._container.querySelectorAll('.style-button')) {
    //     stylesElement.appendChild(buttonEl);
    // }
    // activeStylesElement.appendChild(e.target);
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container)
    this._map = undefined
  }
}

export default StyleSwitcherControl
