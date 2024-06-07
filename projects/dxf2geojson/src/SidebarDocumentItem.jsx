import React from 'react'

class SidebarDocumentItem extends React.Component {
  constructor(props) {
    super(props)
    this.changeOpacity = this.changeOpacity.bind(this)
  }

  changeOpacity(e) {
    this.props.onOpacityChange(this.props.doc, e.target.value)
  }

  render() {
    var pinUnpinButton
    if (!this.props.doc.pinned) {
      pinUnpinButton = (
        <button
          onClick={() => {
            this.props.onPin(this.props.doc)
          }}
          className='btn btn--s flex flex--center-cross'
        >
          <span className='txt-m'>
            <svg className='icon mr6'>
              <use xlinkHref='#icon-point-line-poly' />
            </svg>
          </span>
          Pin to map
        </button>
      )
    } else {
      pinUnpinButton = (
        <button
          onClick={() => {
            this.props.onUnpin(this.props.doc)
          }}
          className='btn btn--s flex flex--center-cross'
        >
          <span className='txt-m'>
            <svg className='icon mr6'>
              <use xlinkHref='#icon-hand' />
            </svg>
          </span>
          Re-position
        </button>
      )
    }

    var stats = (
      <span className='txt-italic'>
        {this.props.doc.entities.length} entities
      </span>
    )
    stats = ''

    var opacitySlider
    if (!this.props.doc.pinned) {
      opacitySlider = (
        <div className='flex flex--center-cross'>
          <div className='txt-bold mr12 txt-s'>Opacity</div>
          <div className='range range--s w120'>
            <input
              type='range'
              min='0'
              max='100'
              value={this.props.doc.opacity}
              onChange={this.changeOpacity}
            />
          </div>
        </div>
      )
    }

    var properties = ''
    if (this.props.isActive) {
      properties = (
        <div className='ml24 mr24 mt6 mb24 w-auto relative'>
          {stats}
          {opacitySlider}
          <div className='mt12 flex'>
            {pinUnpinButton}
            <button
              onClick={() => {
                this.props.onDelete(this.props.doc)
              }}
              className='btn btn--s btn--red flex flex--center-cross ml6'
            >
              <span className='txt-m'>
                <svg className='icon mr6'>
                  <use xlinkHref='#icon-trash' />
                </svg>
              </span>
              Delete
            </button>
          </div>
        </div>
      )
    }

    var triangleClasses = ['triangle', 'ml12']
    if (this.props.isActive)
      triangleClasses = triangleClasses.concat(['triangle--d'])
    else
      triangleClasses = triangleClasses.concat(['triangle--r', 'align-middle'])
    //if (this.props.doc.pinned) triangleClasses.push('color-blue');

    var linkClasses = ['link']
    if (this.props.isActive) linkClasses.push('txt-bold')
    if (this.props.doc.pinned) linkClasses.push('link--blue')
    else linkClasses.push('link--black')

    var c = this.props.doc.visible ? 'color-black' : 'color-gray'

    return (
      <div className='txt-s txt-mono'>
        <div className=''>
          <svg
            className={
              c + ' icon inline-block align-middle mr12 cursor-pointer'
            }
            onClick={() => {
              this.props.onVisibilityChange(
                this.props.doc,
                !this.props.doc.visible
              )
            }}
          >
            <use xlinkHref='#icon-eye' />
          </svg>
          <span
            className={linkClasses.join(' ')}
            onClick={() => {
              this.props.onSelect(this.props.doc.id)
            }}
          >
            {this.props.doc.file.name}

            <span className={triangleClasses.join(' ')}></span>
          </span>
        </div>
        {properties}
      </div>
    )
  }
}

export default SidebarDocumentItem
