import React, { Component } from 'react'
import './Styles.css'

import Alert from '../Alerts/Alert'
import {
  validateString,
  validateEmail,
  setSelectOptions,
} from '../../Functions/Helpers'
import { getElementById } from '../../Functions/Get'
import { customRequest, simpleRequest } from '../../Functions/Post'
import {
  DETAIL_PRODUCTS,
  MODIFY_PRODUCTS,
  NO_ITEMS_ERROR,
  MANDATORY_MESSAGE,
  ERROR_MESSAGE,
  ALERT_TIMEOUT,
  INVALID_STRING_MESSAGE,
  MODIFY_USER,
} from '../../Functions/Constants'

class ModifyProductById extends Component {
  constructor() {
    super()
    this.state = {
      // Request states
      id: 0,
      title: '',
      description: '',
      vendor: '',
      price: '',
      inventory_quantity: '',

      // Auxiliary form states
      alert: '',
      timeout: '',
    }
  }

  componentDidMount() {
    let session_id = sessionStorage.getItem('edit_product_id')
/*     console.log('session_id:', session_id)
 */
    if (session_id && session_id > 0) {
      this.setState({ id: parseInt(session_id) })
      /*       sessionStorage.removeItem('edit_product_id')
       */
      return getElementById(
        DETAIL_PRODUCTS + session_id,
        this.setProductInfo
      )
    }

    return

  }


  componentWillUnmount() {
    clearTimeout(this.state.timeout)
  }

  // Functions to handle states
  handleChange = (event) => {
    let attribute = event.target.id
    let value = event.target.value

    switch (attribute) {
      case 'id':
        if (value > 0) {
          getElementById(DETAIL_PRODUCTS + value, this.setProductInfo)
        }
        break
    }

    return this.setState({ [attribute]: value })
  }

  clearInputs = () => {
    return this.setState({
      id: 0,
      title: '',
      description: '',
      vendor: '',
      price: '',
      inventory_quantity: ''
    })
  }

  // Functions to handle alerts
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

  // Functions related to requests
  setProductInfo = (response, product) => {
    if (response === 'success') {
      // Se extrae el objeto "product" del cuerpo de la respuesta
      this.setState({
        id: product.id,
        title: product.title,
        description: product.body_html,
        vendor: product.vendor,
        price: product.variants[0].price,
        inventory_quantity: product.variants[0].inventory_quantity,
      });

      return this.buildAlert('success', 'Información del producto recuperada.');
    }

    this.clearInputs();

    if (product === NO_ITEMS_ERROR) {
      return this.buildAlert(
        'attention',
        'No se ha encontrado un producto con ese ID. Por favor intente con otro.'
      );
    }

    return this.buildAlert('error', ERROR_MESSAGE);
  };



  responseHandler = (response, body) => {
    if (response == 'success') {
      sessionStorage.removeItem('productList')
      this.buildAlert('success', 'producto modificado con éxito.')

      return this.clearInputs()
    }

    return this.buildAlert('error', ERROR_MESSAGE)
  }

  ModifyProduct = () => {
    let session_id = sessionStorage.getItem('edit_product_id')
    console.log('session_id:', session_id)
    this.close()
  
    // Verify that the required fields are filled
    if (!this.checkMandatoryInputs()) {
      setTimeout(() => this.buildAlert('attention', MANDATORY_MESSAGE), 10)
      return
    }
  
    let body = {
      id: this.state.id,
      title: this.state.title,
      body_html: this.state.description,
      vendor: this.state.vendor,
      variants: [
        {
          price: this.state.price,
          inventory_quantity: this.state.inventory_quantity,
        }
      ]
    }
  
    return customRequest(MODIFY_PRODUCTS + session_id, 'PUT', body, this.responseHandler)
  }
  
  

  // Auxiliary functions
  checkMandatoryInputs() {
    if (this.state.id == 0) {
      return false
    }

    if (!this.state.title) {
      return false
    }

    if (!this.state.description) {
      return false
    }

    if (!this.state.vendor) {
      return false
    }

    return true
  }

  render() {
    return (
      <div className='cu-container'>
        {this.state.alert}
        <span className='global-comp-title'>Modificar Producto por ID</span>
        <span className='global-comp-description'>
          Diligencie el formulario para editar un Producto. Puede especificar el
          ID o seleccionar la acción de editar en la opción de Listar productos
          del menú lateral.
        </span>
        <div className='global-comp-form-container'>
          <span className='global-comp-sub-title'>ESPECIFIQUE EL PRODUCTO</span>
          <span className='global-body-text'>
            Si fue redirigido a través de la opción Listar productos, el
            siguiente campo se diligencia de forma automática.
          </span>
          <div className='global-form-group'>
            <span className='global-form-label'>
              ID
              <strong className='global-form-mandatory'> *</strong>
            </span>
            <input
              id='id'
              type='numeric'
              className='global-form-input'
              value={this.state.id}
              onChange={this.handleChange}
            />
          </div>
          <span className='global-comp-sub-title'>EDITE EL PRODUCTO</span>
          <div className='global-form-group'>
            <span className='global-form-label'>
              Nombre
              <strong className='global-form-mandatory'> *</strong>
            </span>
            <input
              id='title'
              type='text'
              className='global-form-input'
              value={this.state.title}
              onChange={this.handleChange}
            />
          </div>

          <div className='global-form-group'>
            <span className='global-form-label'>
              Descripción
              <strong className='global-form-mandatory'> *</strong>
            </span>
            <input
              id='description'
              type='text'
              className='global-form-input'
              value={this.state.description}
              onChange={this.handleChange}
            />
          </div>

          <div className='global-form-group'>
            <span className='global-form-label'>
              Vendedor
            </span>
            <input
              id='vendor'
              type='text'
              className='global-form-input'
              value={this.state.vendor}
              onChange={this.handleChange}
            />
          </div>


          <div className='global-form-group'>
            <span className='global-form-label'>
              Precio
            </span>
            <input
            id='price'
            type='text'
            className='global-form-input'
            value={this.state.price}
            onChange={this.handleChange}
          />
          </div>

          <div className='global-form-group'>
            <span className='global-form-label'>
              Stock
            </span>
            <input
            id='inventory_quantity'
            type='text'
            className='global-form-input'
            value={this.state.inventory_quantity}
            onChange={this.handleChange}
          />
          </div>

          <div className='global-form-buttons-container'>
            <button
              className='global-form-solid-button'
              onClick={this.ModifyProduct}
            >
              Enviar
            </button>
            <button
              className='global-form-outline-button'
              onClick={this.clearInputs}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default ModifyProductById
