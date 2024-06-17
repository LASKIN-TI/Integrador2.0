import React, { Component } from 'react'
import './Styles.css'

class ModalHourShopify extends Component {
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
            <span className='global-modal-title'>Hora de sincronización Shopify</span>
            <img
              className='global-modal-icon'
              src='./close-white.png'
              alt='close'
              onClick={this.closeModal}
            />
          </div>

          <div className='global-modal-body'>
            <div className='global-modal-group-container'>
              <span className='global-modal-text'>
              La hora visualizada marca el momento de la última sincronización con Shopify a través del integrador cuando se ha activado manualmente el botón "Sincronizar".              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ModalHourShopify
