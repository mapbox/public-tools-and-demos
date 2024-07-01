import React from 'react'

class ModalLayerSelector extends React.Component {
  render() {
    var layers = this.props.layers.map((l, idx) => {
      return (
        <div key={l.layer}>
          <label className='checkbox-container'>
            <input
              type='checkbox'
              defaultChecked={l.selected}
              onChange={(e) => {
                this.props.onUpdateLayer(idx, e.target.checked)
              }}
            />
            <div className='checkbox mr6'>
              <svg className='icon'>
                <use xlinkHref='#icon-check' />
              </svg>
            </div>
            {l.layer}
          </label>
        </div>
      )
    })

    var finishButton = (
      <button className='btn' onClick={this.props.onImport}>
        Import
      </button>
    )

    var cancelButton = (
      <button className='btn btn--red' onClick={this.props.onCancel}>
        Cancel
      </button>
    )
    return (
      <div className='z5 flex flex--center-main flex--center-cross fixed bg-darken75 w-full h-full top left'>
        <div className='flex-child color-white'>
          <h2 className='txt-bold txt-l'>Select layers to import:</h2>
          <div className='w360 hmax480 scroll-auto mb24'>{layers}</div>
          <div className='flex' style={{ justifyContent: 'space-between' }}>
            {finishButton}
            {cancelButton}
          </div>
        </div>
      </div>
    )
  }
}

export default ModalLayerSelector
