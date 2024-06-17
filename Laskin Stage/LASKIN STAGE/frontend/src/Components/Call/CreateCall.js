import React, { Component } from 'react';
import Autosuggest from 'react-autosuggest';
import './Styles.css';

import Alert from '../Alerts/Alert';
import { getElements } from '../../Functions/Get';
import {
  validateString,
  validateEmail,
  setSelectOptions
} from '../../Functions/Helpers';
import { simpleRequest } from '../../Functions/Post';
import {
  LIST_CLIENTS,
  CLIENT_DETAIL,
  MANDATORY_MESSAGE,
  EMAIL_MESSAGE,
  ERROR_MESSAGE,
  USED_EMAIL_ERROR,
  ALERT_TIMEOUT,
  INVALID_STRING_MESSAGE,
  NO_ITEMS_ERROR
} from '../../Functions/Constants';

class CreateCall extends Component {
  constructor() {
    super();
    this.state = {
      clients: [],
      filteredClients: [],
      alert: '',
      timeout: '',
      value: '',
      selectedClient: null,
      showAdditionalFields: false // Agregar estado para controlar la visibilidad de los campos adicionales
    };
  }

  componentDidMount() {
    let session_id = sessionStorage.getItem('user_id');
    getElements('clients', LIST_CLIENTS, this.setClients);
  }

  componentWillUnmount() {
    clearTimeout(this.state.timeout);
  }

  handleChange = (event, { newValue, method }) => {
    this.setState({
      value: newValue,
    });

    if (method === 'click') {
      const selectedClient = this.state.filteredClients.find(client => client.nombre_1 === newValue);
      if (selectedClient) {
        this.setState({ 
          selectedClient,
          showAdditionalFields: true // Mostrar los campos adicionales si se selecciona un cliente
        });
      }
    }
  };

  onSuggestionsFetchRequested = ({ value }) => {
    const searchQuery = value.toLowerCase();
    const filteredClients = this.state.clients.filter(client =>
      client.nombre_1.toLowerCase().includes(searchQuery) ||
      client.nombre_2.toLowerCase().includes(searchQuery) ||
      client.apellido_1.toLowerCase().includes(searchQuery) ||
      client.apellido_2.toLowerCase().includes(searchQuery) ||
      client.doc.toLowerCase().includes(searchQuery)
    );
    this.setState({ filteredClients });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      filteredClients: []
    });
  };

  setClients = async (response, body) => {
    if (response === 'success') {
      this.setState({ clients: body });
      //console.log("Clientes:", body);
    } else {
      this.setState({ clients: [] })
      if (body === NO_ITEMS_ERROR) {
        return this.buildAlert('attention', NO_ITEM_MESSAGE)
      }

      return this.buildAlert('error', ERROR_MESSAGE)
    }
  };

  close = () => {
    return this.setState({ alert: '' });
  };

  buildAlert = (type, text) => {
    clearTimeout(this.state.timeout);

    this.setState({
      timeout: setTimeout(() => this.setState({ alert: '' }), ALERT_TIMEOUT),
    });

    return this.setState({
      alert: <Alert type={type} text={text} close={this.close} />,
    });
  };

  responseHandler = (response, body) => {
    if (response == 'success') {
      this.buildAlert('success', 'Usuario encontrado con éxito.');
    }
    return this.buildAlert('error', ERROR_MESSAGE);
  };

  render() {
    const { value, filteredClients, showAdditionalFields } = this.state;

    const inputProps = {
      placeholder: 'Buscar por nombre o cédula',
      value,
      onChange: this.handleChange,
      className: 'global-form-input'
    };

    return (
      <div className='cu-container'>
        {this.state.alert}
        <span className='global-comp-title'>Crear Pedido Call Center</span>
        <span className='global-comp-description'>
          Diligencie el formulario para crear un nuevo usuario. Todos los campos son obligatorios.
        </span>
        <div className='global-comp-form-container'>
          <div className='global-form-group'>
            <span className='global-form-label'>
              Nombre o cédula
              <strong className='global-form-mandatory'> *</strong>
            </span>
            <Autosuggest
              suggestions={filteredClients}
              onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
              onSuggestionsClearRequested={this.onSuggestionsClearRequested}
              getSuggestionValue={client => client.nombre_1}
              renderSuggestion={client => (
                <div className="autosuggest-suggestion">
                  {client.nombre_1} {client.nombre_2} {client.apellido_1} {client.apellido_2} - {client.doc}
                </div>
              )}
              inputProps={inputProps}
            />
          </div>
        </div>

        {showAdditionalFields && ( // Renderizar campos adicionales solo si showAdditionalFields es verdadero
          <div style={{ paddingTop: '20px' }}>
            <div className='global-comp-form-container'>
              <div className='global-form-group'>
                <span className='global-form-label'>
                  Nombre 1
                  <strong className='global-form-mandatory'> *</strong>
                </span>
                <input
                  id='nombre_1'
                  type='text'
                  className='global-form-input'
                  value={this.state.selectedClient ? this.state.selectedClient.nombre_1 : ''}
                  onChange={this.handleChange}
                />
              </div>
              <div className='global-form-group'>
                <span className='global-form-label'>
                  Nombre 2
                  <strong className='global-form-mandatory'> *</strong>
                </span>
                <input
                  id='nombre_2'
                  type='text'
                  className='global-form-input'
                  value={this.state.selectedClient ? this.state.selectedClient.nombre_2 : ''}
                  onChange={this.handleChange}
                />
              </div>
              <div className='global-form-group'>
                <span className='global-form-label'>
                  Apellido 1
                  <strong className='global-form-mandatory'> *</strong>
                </span>
                <input
                  id='nombre_2'
                  type='text'
                  className='global-form-input'
                  value={this.state.selectedClient ? this.state.selectedClient.apellido_1 : ''}
                  onChange={this.handleChange}
                />
              </div>
              <div className='global-form-group'>
                <span className='global-form-label'>
                  Apellido 2
                  <strong className='global-form-mandatory'> *</strong>
                </span>
                <input
                  id='nombre_2'
                  type='text'
                  className='global-form-input'
                  value={this.state.selectedClient ? this.state.selectedClient.apellido_2 : ''}
                  onChange={this.handleChange}
                />
              </div>
              <div className='global-form-buttons-container'>
                <button
                  style={{marginRight: '20px'}}
                  className='global-form-outline-button'
                  onClick={this.clearInputs}
                >
                  Cancelar
                </button>
                <button
                  className='global-form-solid-button'
                  onClick={this.createUser}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
export default CreateCall;
