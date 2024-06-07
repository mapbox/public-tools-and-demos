import React from 'react'

class TransformControlWidget extends React.Component {
  render() {
    var classes = ['absolute', 'transform-control-widget']

    var styles = {
      width: this.props.size + 'px',
      height: this.props.size + 'px'
    }

    var position = this.props.position.split(' ')
    switch (position[0]) {
      case 'top':
        classes.push('top')
        styles['marginTop'] = -this.props.size / 2 + this.props.offset + 'px'
        break
      case 'bottom':
        classes.push('bottom')
        styles['marginBottom'] = -this.props.size / 2 + this.props.offset + 'px'
        break
      case 'center':
        styles['top'] = 'calc(50% - ' + this.props.size / 2 + 'px)'
        break
      default:
        break
    }

    switch (position[1]) {
      case 'left':
        classes.push('left')
        styles['marginLeft'] = -this.props.size / 2 + this.props.offset + 'px'
        break
      case 'right':
        classes.push('right')
        styles['marginRight'] = -this.props.size / 2 + this.props.offset + 'px'
        break
      case 'center':
        styles['left'] = 'calc(50% - ' + this.props.size / 2 + 'px)'
        break
      default:
        break
    }

    // Set icon
    var iconType = 'circle'
    var rotate = undefined
    if (this.props.type === 'scale') {
      iconType = 'arrow-up-down'
      classes = classes.concat([
        'border',
        'bg-gray-dark',
        'border--transparent',
        'border--green-on-hover',
        'color-green'
      ])
      if (
        this.props.position === 'top left' ||
        this.props.position === 'bottom right'
      )
        rotate = { transform: 'rotate(-45deg)' }
      if (
        this.props.position === 'bottom left' ||
        this.props.position === 'top right'
      )
        rotate = { transform: 'rotate(45deg)' }
    } else if (this.props.type === 'rotate') {
      iconType = 'rotate'
      classes = classes.concat([
        'border',
        'bg-gray-dark',
        'border--transparent',
        'border--blue-on-hover',
        'color-blue'
      ])
    }

    return (
      <div className={classes.join(' ')} style={styles}>
        <svg className='events-none icon w-full h-full' style={rotate}>
          <use xlinkHref={'#icon-' + iconType} />
        </svg>
      </div>
    )
  }
}

export default TransformControlWidget
