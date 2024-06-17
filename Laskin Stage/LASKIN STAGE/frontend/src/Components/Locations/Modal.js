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
        {this.state.alert}
        <div className='global-modal-container'>
          <div className='global-modal-header'>
            <span className='global-modal-title'>Información de la sede:</span>
            <img
              className='global-modal-icon'
              src='./close-white.png'
              alt='close'
              onClick={this.closeModal}
            />
          </div>


          <div className='global-modal-body'>

          <div className='global-modal-group-container'>
            <span className='global-form-label'>ID Sucursal:</span>
            <span className='global-modal-text'>
              {this.props.id_sucursal}
            </span>
          </div>

          <div className='global-modal-group-container'>
            <span className='global-form-label'>ID Bodega:</span>
            <span className='global-modal-text'>
              {this.props.location_id_reference}
            </span>
          </div>
          
            <div className='global-modal-group-container'>
              <span className='global-form-label'>Latitud: </span>
              <span className='global-modal-text'>
                {this.props.latitude}
              </span>
            </div>

            <div className='global-modal-group-container'>
              <span className='global-form-label'>Longitud:</span>
              <span className='global-modal-text'>
                {this.props.longitude}
              </span>
            </div>

            <div className='global-modal-group-container'>
              <span className='global-form-label'>Inicio hora laboral:</span>
              <span className='global-modal-text'>
                {this.props.start_laboral}
              </span>
            </div>

            <div className='global-modal-group-container'>
              <span className='global-form-label'>Fin hora laboral:</span>
              <span className='global-modal-text'>
                {this.props.end_laboral}
              </span>
            </div>

            <div className='global-modal-group-container'>
              <span className='global-form-label'>Teléfono de la sede:</span>
              <span className='global-modal-text'>
                {this.props.tel_sede}
              </span>
            </div>

          </div>
        </div>
      </div>
    )
  }
}

export default Modal
