import React from 'react'
import PropTypes from 'prop-types'
import Copiable from '@mapbox/mr-ui/copiable'

const TableRow = ({ label, value, noBorder }) => (
    <div
      className={`flex flex--center-cross py3 ${
        !noBorder && 'border-b border--gray-light'
      }`}
    >
      <div
        scope='row'
        className='w120 align-r py3 txt-s txt-bold flex-child-no-shrink'
      >
        {label}
      </div>
      <div 
        className='txt-mono txt-ms pl12 flex-child-grow copiable-container overflow-auto'
        //style={{whiteSpace: "pre"}}
        >
        <Copiable value={value} />
      </div>
    </div>
  )

  export default TableRow
  
  TableRow.propTypes = {
    label: PropTypes.any,
    noBorder: PropTypes.any,
    value: PropTypes.any
  }
