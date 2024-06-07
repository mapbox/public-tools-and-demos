import React from 'react'
import SidebarDocumentItem from './SidebarDocumentItem'

class GeoreferencerSidebar extends React.Component {
  constructor(props) {
    super(props)

    this.state = { unlockTip: false }

    this.handleCheckbox = this.handleCheckbox.bind(this)
  }

  handleCheckbox(e) {
    this.props.setMapLock(e.target.checked)
  }
  componentDidUpdate(prevProps) {
    if (this.props.showUnlockTip && !prevProps.showUnlockTip) {
      this.setState({ unlockTip: this.props.showUnlockTip })
    }
  }
  render() {
    var docList = (
      <>
        <div className='flex flex--center-cross'>
          <div className='flex-child-grow txt-bold'>Items</div>
          <label className='switch-container'>
            <input
              type='checkbox'
              checked={this.props.mapLocked}
              onChange={this.handleCheckbox}
            />
            <div className='switch mr6 switch--s-label'></div>
            <svg className='icon mr3 align-middle'>
              <use xlinkHref='#icon-lock' />
            </svg>{' '}
            <span className='txt-s align-middle'>Lock Map</span>
          </label>
        </div>
        <hr className='txt-hr my6'></hr>
        {this.props.documents.map((doc) => {
          var isActive = doc.id === this.props.activeDocument

          return (
            <SidebarDocumentItem
              key={doc.id}
              doc={doc}
              isActive={isActive}
              onPin={this.props.onPinDocument}
              onUnpin={this.props.onUnpinDocument}
              onDelete={this.props.onDeleteDocument}
              onVisibilityChange={this.props.onVisibilityChange}
              onSelect={this.props.onSelectDocument}
              onOpacityChange={this.props.onOpacityChange}
            />
          )
        })}
      </>
    )

    if (this.props.documents.length === 0) {
      docList = (
        <div className='txt-s'>
          <span className='txt-s txt-bold'>To get started:</span>
          <ul className='txt-ol'>
            <li className='txt-li'>
              Move the map to the area you want to add your drawing to.
            </li>
            <li className='txt-li'>
              Drag and drop a DXF file onto this window.
            </li>
          </ul>
        </div>
      )
    }

    var disabled = !this.props.geoJSONURL
    var downloadButtonClasses = [
      'btn',
      'round',
      'block',
      'cursor-pointer',
      'flex-child--grow'
    ]
    var sendButtonClasses = downloadButtonClasses.slice()
    if (disabled) {
      downloadButtonClasses = downloadButtonClasses.concat([
        'bg-gray',
        'color-gray-light'
      ])
      sendButtonClasses = sendButtonClasses.concat([
        'bg-gray',
        'color-gray-light'
      ])
    } else {
      downloadButtonClasses = downloadButtonClasses.concat([
        'bg-green',
        'bg-green-dark-on-hover'
      ])
      sendButtonClasses = sendButtonClasses.concat([
        'bg-pink',
        'bg-pink-light-on-hover'
      ])
    }

    sendButtonClasses.push('ml12')

    var url
    if (!disabled) {
      url = this.props.geoJSONURL
    }

    var unlockTip

    if (this.props.showUnlockTip) {
      unlockTip = (
        <div
          className={'animation--speed-1 absolute z3 animation-fade-in'}
          style={{
            marginLeft: 317,
            marginTop: 80
          }}
        >
          <div className='flex inline-flex'>
            <span className='flex-child triangle triangle--l color-gray-dark mt6'></span>
            <div className='flex-child px12 py12 w240 round txt-s bg-gray-dark color-white'>
              ⚠️ The map is locked while positioning your drawing. If you need
              to move the map, you can unlock it, but the position of any
              un-pinned drawings will be lost.
            </div>
          </div>
        </div>
      )
    }

    return (
      <div
        className='sidebar flex flex--column w-full p6'
        style={{ justifyContent: 'space-between' }}
        id={this.props.id}
      >
        <div className='mb12 txt-s'>
          This tool helps you convert a DXF file to geojson. You can move,
          rotate, and scale the vectors to position them with precision on the
          map.
        </div>
        <div className='mb12 txt-s'>
          LINE and POLYLINE entities will be converted into geojson LineStrings.
          SPLINE entites will be converted into Polygons.
        </div>
        <div className='flex-child mb12 border border--gray-light round px12 py12'>
          {docList}
        </div>
        <div className='flex-child flex'>
          <a
            href={url}
            className={downloadButtonClasses.join(' ')}
            download='out.json'
            id='saveButton'
            disabled={disabled}
          >
            <svg className='icon inline align-middle'>
              <use xlinkHref='#icon-floppy' />
            </svg>{' '}
            Save GeoJSON
          </a>
          {/* <a href={ url } className={ sendButtonClasses.join(" ") } download="out.json" id="sendButton" disabled={disabled}>
                        <svg className='icon inline align-middle'><use xlinkHref='#icon-floppy'/></svg> Save to dataset
                    </a> */}
        </div>

        {unlockTip}
      </div>
    )
  }
}

export default GeoreferencerSidebar
