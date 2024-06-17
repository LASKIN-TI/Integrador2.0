import React, { Component } from 'react'
import './Styles.css'

import { simpleRequest } from '../../Functions/Post'
import Alert from '../Alerts/Alert'
import {
  validateString,
  validateEmail,
  setSelectOptions,
} from '../../Functions/Helpers'

import {
  CREATE_SHARE,
  MANDATORY_MESSAGE,
  EMAIL_MESSAGE,
  ERROR_MESSAGE,
  ALERT_TIMEOUT,
  INVALID_STRING_MESSAGE,
} from '../../Functions/Constants'

class Modal extends Component {
  constructor() {
    super()
    this.state = {
      emailShare: '',
      alert: '',
      timeout: '',
    }
  }

  componentWillUnmount() {
    clearTimeout(this.state.timeout)
  }

  closeModal = () => {
    return this.props.closeModal()
  }

  handleChange = (event) => {
    let attribute = event.target.id
    let value = event.target.value

    return this.setState({ [attribute]: value })
  }


  clearInputs = () => {
    return this.setState({
      emailShare: '',
    })
  }

  close = () => {
    return this.setState({ alert: '' })
  }

  buildAlert = (type, text) => {
    clearTimeout(this.state.timeout)

    this.setState({
      timeout: setTimeout(() => this.setState({ alert: '' }), ALERT_TIMEOUT),
    })

    return this.setState({
      alert: <Alert type={type} text={text} close={this.close} />,
    })
  }

  checkMandatoryInputs() {
   
    if (!this.state.emailShare) {
      return false
    }

    return true
  }

  responseHandler = (response, body) => {
    if (response == 'success') {
      this.buildAlert('success', 'Se ha compartido con exito')

      return this.clearInputs()
      
    }


    return this.buildAlert('error', ERROR_MESSAGE)
  }

  share = () => {
    this.close()
    // Verify that the required fields are filled
    if (!this.checkMandatoryInputs()) {
      setTimeout(() => this.buildAlert("attention", MANDATORY_MESSAGE), 10);
      return;
    }

    let body = {
      emailShare: this.state.emailShare,
      idList: this.props.id,
      idCreationUser: this.props.session_id
    };

/*     return simpleRequest(CREATE_SHARE, "POST", body, this.responseHandler);
 */  };

  render() {
    return (
      <div className='global-modal-background'>
         {this.state.alert}
        <div className='global-modal-container'>
          <div className='global-modal-header'>
            <span className='global-modal-title'>Compartir</span>
            <img
              className='global-modal-icon'
              src='./close_white.png'
              alt='close'
              onClick={this.closeModal}
            />
          </div>

          <div className='global-modal-body'>
            <div className='global-modal-group-container'>
              <span className='global-form-label'>Compartiras: </span>
              <span className='global-modal-text'>
                {this.props.name}
              </span>
            </div>

            <div className='global-modal-group-container'>
              <span className='global-form-label'>Email de la persona:</span>
              <span className='global-modal-text'>
                <input
                  id="emailShare"
                  type="email"
                  value={this.state.emailShare}
                  onChange={this.handleChange}
                  className="global-form-input"
                ></input>
              </span>
            </div>
            <div className="global-form-buttons-container">
              <button
                className="global-form-solid-button"
                onClick={this.share}
              >
                Enviar
              </button>
              <button
                className="global-form-outline-button"
                onClick={this.closeModal}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Modal
