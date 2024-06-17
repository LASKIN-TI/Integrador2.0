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
            <span className='global-modal-title'>Panel de Procedimientos</span>
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
                Bienvenido al Panel de Sincronización de Procedimientos desde HitoWeb hacia Shopify.<br /><br />
                Este panel muestra los procedimientos importados de Shopify y destaca las diferencias con respecto a HitoWeb, como cambios en los precios, que se resaltan en color rojo. Si un procedimiento es nuevo, toda la fila se mostrará en rojo.<br /><br />
                Utilice los filtros disponibles para navegar y gestionar la información de manera eficiente.
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Modal
