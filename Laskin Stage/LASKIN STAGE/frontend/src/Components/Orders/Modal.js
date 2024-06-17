import React, { Component } from 'react'
import './Styles.css'

class Modal extends Component {
  constructor() {
    super()
    this.state = {}
  }

  closeModal = () => {
    return this.props.closeModal()
  }

  render() {
    return (
      <div className='global-modal-background'>
        <div className='global-modal-container'>
          <div className='global-modal-header'>
            <span className='global-modal-title'>Información de la órden</span>
            <img
              className='global-modal-icon'
              src='./close-white.png'
              alt='close'
              onClick={this.closeModal}
            />
          </div>

          <div className='global-modal-body'>

            <div className='global-modal-group-container'>
              <span className='global-form-label'>ID: </span>
              <span className='global-modal-text'>
                {this.props.order_ref}
              </span>
            </div>

            <div className='global-modal-group-container'>
              <span className='global-form-label'>Referencia Shopify: </span>
              <span className='global-modal-text'>
                {this.props.id_shopify}
              </span>
            </div>

            <div className='global-modal-group-container'>
              <span className='global-form-label'>JSON de la órden:</span>
              <span className='global-modal-text'>
              {this.props.json}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Modal
