import React from 'react'

class DragDropFileHandler extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      active: false,
      hovering: false,
      loading: false
    }

    this._onDragIn = this._onDragIn.bind(this)
    this._onDragOut = this._onDragOut.bind(this)
    this._onDrop = this._onDrop.bind(this)
    this._handleFile = this._handleFile.bind(this)
    this._isValid = this._isValid.bind(this)
  }

  componentDidMount() {
    // this.props.el.addEventListener('dragenter', this.props.onAdd);
    this.props.dropzone.addEventListener('dragenter', this._onDragIn)
    this.props.dropzone.addEventListener('dragover', this._onDragIn)
    this.props.dropzone.addEventListener('dragexit', this._onDragOut)
    this.props.dropzone.addEventListener('drop', this._onDrop)
  }
  _onDragIn(e) {
    e.preventDefault()
    e.stopPropagation()
    this.setState({ active: true, hovering: true })
  }
  _onDragOut(e) {
    e.preventDefault()
    e.stopPropagation()
    this.setState({ active: false, hovering: false })
  }
  _onDrop(e) {
    e.preventDefault()
    e.stopPropagation()

    // Make sure a file was dropped
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0]
      this.props.onDrop()
      this._handleFile(file)
    }
    //this.props.onAdd(file);
  }
  _handleFile(file) {
    if (!this._isValid(file)) {
      this.props.onError(
        file,
        `Invalid file type. Must be one of (${this.props.validExtensions.join(
          ', '
        )})`
      )
      this.setState({ active: false, loading: false, hovering: false })
      return
    }

    this.props.onAdd(file)
    this.setState({ active: false, loading: false, hovering: false })
    //this.setState({'active': true, 'loading': true, 'hovering': false});
  }
  _isValid(file) {
    const filename = file.name ? file.name.toLowerCase() : ''
    let valid = false
    this.props.validExtensions.forEach((extension) => {
      if (valid) return
      valid = filename.indexOf(extension) !== -1
    })

    return valid
  }

  render() {
    var styles = [
      'absolute',
      'top',
      'left',
      'w-full',
      'h-full',
      'bg-darken25',
      'z5'
    ]
    if (!this.state.active) {
      styles.push('none')
      styles.push('events-none')
    }
    if (this.state.loading) {
      styles.push('loading')
    }

    var message = ''
    if (this.state.hovering) {
      message = (
        <div className='flex flex--center-main flex--center-cross w-full h-full'>
          <div className='txt-bold flex-child txt-xl color-white'>
            <svg className='icon h42 w42 inline-block mr12 align-middle'>
              <use xlinkHref='#icon-airplane' />
            </svg>
            Drop your DXF files here
          </div>
        </div>
      )
    }

    return <div className={styles.join(' ')}>{message}</div>
  }
}

export default DragDropFileHandler
