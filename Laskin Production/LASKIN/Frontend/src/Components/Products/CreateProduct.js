import React, { Component } from 'react';
import './Styles.css';
import { simpleAlert } from '../../Functions/SwalAlert';
import Alert from '../Alerts/Alert';
import {
  validateString,
  validateEmail,
  setSelectOptions,
} from '../../Functions/Helpers';
import { customRequest, customRequest2 } from '../../Functions/Post';
import { getElements } from '../../Functions/Get';
import {
  CREATE_PRODUCTS,
  STATUS,
  MANDATORY_MESSAGE,
  ERROR_MESSAGE,
  ALERT_TIMEOUT,
  INVALID_STRING_MESSAGE,
  PRODUCTS_SHOPIFY,
  NO_ITEMS_ERROR
} from '../../Functions/Constants';

class CreateProduct extends Component {
  constructor() {
    super();
    this.state = {
      lists: [],
      title: '',
      description: '',
      vendor: '',
      status: '',
      price: '',
      sku: '',

      alert: null,
      timeout: null,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentWillUnmount() {
    clearTimeout(this.state.timeout);
  }

  componentDidMount() {
    let session_id = sessionStorage.getItem('user_id');
    getElements('list', PRODUCTS_SHOPIFY, this.setLists);
  }

  handleChange = (event) => {
    let attribute = event.target.id
    let value = event.target.value

    return this.setState({ [attribute]:value})
  }

  setLists = async (response, body) => {
    if (response === 'success') {
      // Agregar la propiedad "selected" a cada objeto y establecerla según el valor del campo "status"
      let lists = body.products.map((product) => ({
        ...product,
        selected: product.status === 'active',
      }));
      this.setState({ lists });
    } else if (body === NO_ITEMS_ERROR) {
      this.buildAlert('attention', NO_ITEM_MESSAGE);
    } else {
      this.buildAlert('error', ERROR_MESSAGE);
    }
  };

  // Functions to handle states
  handleInputChange(event) {
    const target = event.target;
    const name = target.name;
    const value = target.value;

    this.setState({ [name]: value });
  }

  clearInputs = () => {
    this.setState({
      title: '',
      description: '',
      vendor: '',
      status: '',
    });
  };

  // Functions to handle alerts
  close = () => {
    this.setState({ alert: null });
  };

  buildAlert = (type, text) => {
    clearTimeout(this.state.timeout);

    this.setState({
      timeout: setTimeout(() => this.setState({ alert: null }), ALERT_TIMEOUT),
    });

    this.setState({
      alert: <Alert type={type} text={text} close={this.close} />,
    });

    console.log(`Alerta: Tipo "${type}", Texto "${text}"`); // Mostrar en la consola
/*     alert(`Alerta: Tipo "${type}", Texto "${text}"`); // Mostrar en un alert en el navegador
 */  };

  // Functions related to requests
  responseHandler = (response, body) => {
    if (response === 'success') {
      this.buildAlert('success', 'Producto creado con éxito');

      this.clearInputs();

      // Recargar la lista después de crear un producto
      getElements('list', PRODUCTS_SHOPIFY, this.setLists);
    } else {
      this.buildAlert('error', ERROR_MESSAGE);
    }
  };

  checkIfProductExists = (productName) => {
    const { lists } = this.state;
    return lists.some((product) => product.title === productName);
  };
  
  createProduct = () => {
    this.close();
  
    // Verify that the required fields are filled
    if (!this.checkMandatoryInputs()) {
      setTimeout(() => this.buildAlert('attention', MANDATORY_MESSAGE), 10);
      return;
    }
  
    // Verify that desc is valid
    if (!validateString(this.state.description)) {
      setTimeout(() => this.buildAlert('attention', INVALID_STRING_MESSAGE), 10);
      return;
    }
  
    // Verify that name is valid
    if (!validateString(this.state.title)) {
      setTimeout(() => this.buildAlert('attention', INVALID_STRING_MESSAGE), 10);
      return;
    }
  
    // Verify that name is valid
    if (!validateString(this.state.vendor)) {
      setTimeout(() => this.buildAlert('attention', INVALID_STRING_MESSAGE), 10);
      return;
    }
  
    // Verify that name is valid
    if (!validateString(this.state.status)) {
      setTimeout(() => this.buildAlert('attention', INVALID_STRING_MESSAGE), 10);
      return;
    }
  
    // Verifica si el producto ya existe en la lista
    if (this.checkIfProductExists(this.state.title)) {
      console.log(`El producto "${this.state.title}" ya existe en la lista. No se creará.`);
      this.buildAlert('attention', `El producto "${this.state.title}" ya existe en la lista. No se creará.`);
      return;
    }
  
    let product = {
      id: 123,
      title: this.state.title,
      body_html: `<strong>${this.state.description}</strong>`,
      vendor: this.state.vendor,
      status: this.state.status,
      variants: [
        {
          option1: "Default Title",
          price: this.state.price,
          sku: this.state.sku
        }
      ],
      tags: "Producto"
    };
  
    customRequest(CREATE_PRODUCTS, 'POST', product, this.responseHandler);
  };
  

  // Auxiliary functions
  checkMandatoryInputs() {
    if (!this.state.title) {
      return false;
    }

    if (!this.state.description) {
      return false;
    }

    if (!this.state.vendor) {
      return false;
    }

    if (!this.state.status) {
      return false;
    }

    return true;
  }

  render() {
    return (
      <div className='cu-container'>
        {this.state.alert}
        <span className='global-comp-title'>Crear Producto</span>
        <span className='global-comp-description'>
          Aquí podrá crear un producto en Shopify.
        </span>

        <div className='global-comp-form-container'>
          <div className='global-form-group'>
            <span className='global-form-label'>
              Título
              <strong className='global-form-mandatory'> *</strong>
            </span>
            <input
              name='title'
              type='text'
              className='global-form-input'
              value={this.state.title}
              onChange={this.handleInputChange}
            />
          </div>

          <div className='global-form-group'>
            <span className='global-form-label'>
              Descripción
              <strong className='global-form-mandatory'> *</strong>
            </span>
            <input
              name='description'
              type='text'
              className='global-form-input'
              value={this.state.description}
              onChange={this.handleInputChange}
            />
          </div>

          <div className='global-form-group'>
            <span className='global-form-label'>
              Vendedor
              <strong className='global-form-mandatory'> *</strong>
            </span>
            <input
              name='vendor'
              type='text'
              className='global-form-input'
              value={this.state.vendor}
              onChange={this.handleInputChange}
            />
          </div>

          <div className='global-form-group'>
            <span className='global-form-label'>
              SKU
              <strong className='global-form-mandatory'> *</strong>
            </span>
            <div className='global-form-input-group'>
              <input 
                name='sku'
                type='text'
                className='global-form-input'
                value={this.state.sku}
                onChange={this.handleInputChange}
              />
            </div>
          </div>

          <div className='global-form-group'>
            <span className='global-form-label'>
              Precio
              <strong className='global-form-mandatory'> *</strong>
            </span>
            <div className='global-form-input-group'>
              <input
                name='price'
                type='number'
                className='global-form-input'
                value={this.state.price}
                onChange={this.handleInputChange}
              />
            </div>
          </div>

          <div className='global-form-group'>
            <span className='global-form-label'>
              Estado
              <strong className='global-form-mandatory'> *</strong>
            </span>
            <select
            id='status'
            className='global-form-input-select'
            value={this.state.status}
            onChange={this.handleChange}
            >
              <option
              className='global-form-input-select-option'
              value=''
              disabled={true}
              >
                Seleccione un estado...
              </option>
              {setSelectOptions(STATUS)}
            </select>
          </div>


          <div className='global-form-buttons-container'>
            <button
              className='global-form-solid-button'
              onClick={this.createProduct}
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
    );
  }
}

export default CreateProduct;
