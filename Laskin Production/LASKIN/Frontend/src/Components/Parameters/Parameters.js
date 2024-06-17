import React, { Component } from 'react'
import './Styles.css'

import Alert from '../Alerts/Alert'
import {
  validateString,
  validateEmail,
  setSelectOptions,
} from '../../Functions/Helpers'
import { simpleRequest3 } from '../../Functions/Post'
import { getElements } from '../../Functions/Get';

import {
  STOCK,
  GOOGLE,
  UPDATE_GOOGLE,
  ERROR_MESSAGE,
  SEDE_DEFAULT,
  ALERT_TIMEOUT,
  INVALID_STRING_MESSAGE,
  NO_ITEMS_ERROR,
  UPDATE_STOCK,
  UPDATE_MESSAGE,
  LIST_LOCATIONS,
  MESSAGES,
  MANDATORY_MESSAGE,
  UPDATE_SEDE,
  ACTIVE_MESSAGES,
  UPDATE_ACTIVE,
  ACTIVE_HOOKS,
  UPDATE_SYNC
} from '../../Functions/Constants'

class Parameters extends Component {
  constructor() {
    super()
    this.state = {
      stockDefaultValue: '',
      stock: '',

      url: '',
      token: '',
      time_noti: '',
      start_laboral: '',
      end_laboral: '',
      tel_responsable: '',
      template_name: '',
      template_nuevos: '',
      sededefault: '',

      tokenGoogle: '',

      active: false,
      active_hook: false,
      active_sync: false,

      locations: [],

      sede: '',
      sede_id: '',

      alert: '',
      timeout: '',
    }
  }

  componentWillUnmount() {
    clearTimeout(this.state.timeout)
  }

  componentDidMount() {
    let session_id = sessionStorage.getItem('user_id');
    getElements('stock', STOCK, this.setStock);
    getElements('message', MESSAGES, this.setMessages);
    getElements('tokenGoogle', GOOGLE, this.setTokenGoogle);
    getElements('locations', LIST_LOCATIONS, this.setlocations);
    getElements('sededefault', SEDE_DEFAULT, this.setSede);
    getElements('active', ACTIVE_MESSAGES, this.setActive);
    getElements('activehook', ACTIVE_HOOKS, this.setActiveHooks)


  }

  // Functions to handle states
  handleChange = (event) => {
    const attribute = event.target.id;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
  
    if (attribute === 'sede') {
      // Encuentra el ID correspondiente a la sede seleccionada
      const selectedLocation = this.state.locations.find(location => location.name === value);
      if (selectedLocation) {
        this.setState({
          [attribute]: value,
          sede_id: selectedLocation.id_sucursal // Actualiza sede_id con el ID correspondiente
        }, () => {
          // Esto se ejecutará después de que el estado se actualice
          console.log("Sede ID actualizado:", this.state.sede_id);
        });
      }
    } else {
      this.setState({ [attribute]: value });
    }
  }
  


  setStock = async (response, body) => {
    //console.log("Body:", body);

    if (response === 'success') {
      this.setState({
        stock: body.stock.value
      })
      return this.buildAlert('success', 'Información recuperada.')
    }

    if (body === NO_ITEMS_ERROR) {
      return this.buildAlert('attention', NO_ITEM_MESSAGE);
    }

    return this.buildAlert('error', ERROR_MESSAGE);
  }

  setActive = async (response, body) => {
    if (response === 'success') {
      const isActive = body.active.value === 1; // Convierte 1 a true, cualquier otro valor será false
      this.setState({
        active: isActive
      });
      return this.buildAlert('success', 'Información recuperada.')
    }

    if (body === NO_ITEMS_ERROR) {
      return this.buildAlert('attention', NO_ITEM_MESSAGE);
    }

    return this.buildAlert('error', ERROR_MESSAGE);
  }

  setActiveHooks = async (response, body) => {
    if (response === 'success') {
      const activeStates = body.active.reduce((acc, item) => {
        acc[item.name] = item.value === 1;
        return acc;
      }, {});
  
      this.setState({
        active_sync: activeStates.syncProductos,
        active_hook: activeStates.syncPedidos,
      });
  
      return this.buildAlert('success', 'Información recuperada.');
    }
  
    if (body === NO_ITEMS_ERROR) {
      return this.buildAlert('attention', NO_ITEM_MESSAGE);
    }
  
    return this.buildAlert('error', ERROR_MESSAGE);
  };


  setSede = async (response, body) => {
    if (response === 'success') {
      this.setState({
        sededefault: body.sede.token,
        sede: body.sede.token,
        sede_id: body.sede.value
      });
      return this.buildAlert('success', 'Información recuperada.');
    }

    if (body === NO_ITEMS_ERROR) {
      return this.buildAlert('attention', NO_ITEM_MESSAGE);
    }

    return this.buildAlert('error', ERROR_MESSAGE);
  }


  setlocations = async (response, body) => {
    if (response === 'success') {
      this.setState({ locations: body });
      //return this.buildAlert('success', 'Formularios listados correctamente')
    } else {
      this.setState({ locations: [] })
      if (body === NO_ITEMS_ERROR) {
        return this.buildAlert('attention', NO_ITEM_MESSAGE)
      }

      return this.buildAlert('error', ERROR_MESSAGE)
    }
  };

  setTokenGoogle = async (response, body) => {
    //console.log("Body:", body);

    if (response === 'success') {
      this.setState({
        tokenGoogle: body.credential.token
      })
      return this.buildAlert('success', 'Información recuperada.')
    }

    if (body === NO_ITEMS_ERROR) {
      return this.buildAlert('attention', NO_ITEM_MESSAGE);
    }

    return this.buildAlert('error', ERROR_MESSAGE);
  }

  setMessages = async (response, body) => {
    //console.log("Body:", body);
    if (response === 'success') {
      this.setState({
        url: body.parameterMessages.url,
        token: body.parameterMessages.token,
        time_noti: body.parameterMessages.time_noti,
        start_laboral: body.parameterMessages.start_laboral,
        end_laboral: body.parameterMessages.end_laboral,
        tel_responsable: body.parameterMessages.tel_responsable,
        template_name: body.parameterMessages.template_name,
        template_nuevos: body.parameterMessages.template_nuevos
      });
      return this.buildAlert('success', 'Información recuperada.');
    }

    if (body === NO_ITEMS_ERROR) {
      //console.log("No items error:", NO_ITEMS_ERROR);
      return this.buildAlert('attention', NO_ITEM_MESSAGE);
    }

    //console.log("Error message:", ERROR_MESSAGE);
    return this.buildAlert('error', ERROR_MESSAGE);
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
  responseHandler = (response, body) => {
    if (response === 'success') {
      this.buildAlert('success', 'Stock actualizado con éxito.');
    } else {
      this.buildAlert('error', ERROR_MESSAGE);
    }
  }

  responseHandler2 = (response, body) => {
    if (response === 'success') {
      this.buildAlert('success', 'Campos de notificaciones actualizados con éxito.');
    } else {
      this.buildAlert('error', ERROR_MESSAGE);
    }
  }

  responseHandler3 = (response, body) => {
    if (response === 'success') {
      this.buildAlert('success', 'Token de Google actualizado con éxito.');
    } else {
      this.buildAlert('error', ERROR_MESSAGE);
    }
  }

  responseHandler4 = (response, body) => {
    if (response === 'success') {
      this.buildAlert('success', 'Sede por defecto actualizada con éxito.');
    } else {
      this.buildAlert('error', ERROR_MESSAGE);
    }
  }

  responseHandler5 = (response, body) => {
    if (response === 'success') {
      this.buildAlert('success', 'Parámetros de sincronización actualizados con éxito.');
    } else {
      this.buildAlert('error', ERROR_MESSAGE);
    }
  }

  updateStock = () => {
    const { stock } = this.state;
    let body = {
      value: stock
    }
    return simpleRequest3(UPDATE_STOCK, 'PUT', body, this.responseHandler)
  }

  updateActive = () => {
    const { active } = this.state;
    let body = {
      //active: active === 'on' ? true : false // Convertir 'on' a true, cualquier otro valor será false
      active: active
    };
    console.log(body);
    return simpleRequest3(UPDATE_ACTIVE, 'PUT', body, this.responseHandler2)
  }


  updateParameterMessage = () => {
    const { url, token, time_noti, start_laboral, end_laboral, tel_responsable, template_name, template_nuevos } = this.state;
    let body = {
      url: url,
      token: token,
      time_noti: time_noti,
      start_laboral: start_laboral,
      end_laboral: end_laboral,
      tel_responsable: tel_responsable,
      template_name: template_name,
      template_nuevos: template_nuevos
    }

    console.log(body);
    return simpleRequest3(UPDATE_MESSAGE, 'PUT', body, this.responseHandler2)
  }

  updateTokenGoogle = () => {
    if (!this.checkMandatoryInputs()) {
      setTimeout(() => this.buildAlert('attention', MANDATORY_MESSAGE), 10)
      return
    }

    const { tokenGoogle } = this.state;
    let body = {
      token: tokenGoogle,

    }
    return simpleRequest3(UPDATE_GOOGLE, 'PUT', body, this.responseHandler3)
  }

  updateSede = () => {
    if (!this.checkMandatoryInputs()) {
      setTimeout(() => this.buildAlert('attention', MANDATORY_MESSAGE), 10)
      return
    }

    const { sede, sede_id } = this.state;
    let body = {
      token: sede,
      value: sede_id
    }

    console.log(body);
    return simpleRequest3(UPDATE_SEDE, 'PUT', body, this.responseHandler4)
  }

  updateSync = () => {
    const { active_hook, active_sync } = this.state;
    let body = {
      active_hook: active_hook,
      active_sync: active_sync
    };
    console.log(body);
    return simpleRequest3(UPDATE_SYNC, 'PUT', body, this.responseHandler5)
  }


  // Auxiliary functions
  checkMandatoryInputs() {
    if (!this.state.tokenGoogle) {
      return false
    }

    if (!this.state.sede) {
      return false
    }


    return true
  }


  render() {
    return (
      <div className='cu-container'>
        {this.state.alert}
        <span className='global-comp-title'>Parametrización</span>
        <span className='global-comp-description'>
          Aquí podrás cambiar la estandarización de los parámetros para el integrador.
        </span>
        <div className='global-comp-form-container'>
          <span className='global-comp-title'>Stock de seguridad</span>
          <div className='global-form-group'>
            <span className='global-form-label'>
              Stock
            </span>
            <input
              id='stock'
              className='global-form-input param'
              name='stock'
              type='number'
              value={this.state.stock}
              onChange={this.handleChange}
            />

            <div className='global-form-buttons-container'>
              <button
                className='global-form-solid-button'
                onClick={this.updateStock}
              >
                Guardar
              </button>
            </div>
          </div>
          <div>
            <span className='global-form-label'>Se colocará el stock en 0 a partir de {this.state.stock} unidad(es)</span>
          </div>
        </div>

        <div style={{ paddingTop: '20px' }}>
          <div className='global-comp-form-container'>
            <span className='global-comp-title'>Notificaciones de pedidos</span>

            <div className='global-form-group'>
              <span className='global-form-label'>
                Activo
                <strong className='global-form-mandatory'> *</strong>
              </span>
              <input
                id='active'
                type='checkbox'
                style={{ marginTop: '20px' }}
                checked={this.state.active}
                onChange={this.handleChange}
              />
            </div>

            <div className='global-form-group'>
              <span className='global-form-label'>
                Url
                <strong className='global-form-mandatory'> *</strong>
              </span>
              <input
                id='url'
                type='text'
                className='global-form-input'
                value={this.state.url}
                onChange={this.handleChange}
              />
            </div>

            <div className='global-form-group'>
              <span className='global-form-label'>
                Token
                <strong className='global-form-mandatory'> *</strong>
              </span>
              <input
                id='token'
                type='text'
                className='global-form-input'
                value={this.state.token}
                onChange={this.handleChange}
              />
            </div>

            <div className='global-form-group'>
              <span className='global-form-label'>
                Minutos de envío de mensaje
                <strong className='global-form-mandatory'> *</strong>
              </span>
              <input
                id='time_noti'
                type='number'
                className='global-form-input'
                value={this.state.time_noti}
                onChange={this.handleChange}
              />
            </div>

            <span className='global-comp-title'>Pedidos nuevos</span>


            <div className='global-form-group'>
              <span className='global-form-label'>
                Template
                <strong className='global-form-mandatory'> *</strong>
              </span>
              <input
                id='template_nuevos'
                type='text'
                className='global-form-input'
                value={this.state.template_nuevos}
                onChange={this.handleChange}
              />
            </div>

            <span className='global-comp-title'>Pedidos atrapados</span>

            <div className='global-form-group'>
              <span className='global-form-label'>
                Inicio de horario laboral
                <strong className='global-form-mandatory'> *</strong>
              </span>
              <input
                id='start_laboral'
                type='text'
                className='global-form-input'
                value={this.state.start_laboral}
                onChange={this.handleChange}
              />
            </div>

            <div className='global-form-group'>
              <span className='global-form-label'>
                Fin de horario laboral
                <strong className='global-form-mandatory'> *</strong>
              </span>
              <input
                id='end_laboral'
                type='text'
                className='global-form-input'
                value={this.state.end_laboral}
                onChange={this.handleChange}
              />
            </div>

            <div className='global-form-group'>
              <span className='global-form-label'>
                Teléfono receptor (con prefijo)
                <strong className='global-form-mandatory'> *</strong>
              </span>
              <input
                id='tel_responsable'
                type='text'
                className='global-form-input'
                placeholder='573211234567 (con prefijo)'
                value={this.state.tel_responsable}
                onChange={this.handleChange}
              />
            </div>

            <div className='global-form-group'>
              <span className='global-form-label'>
                Template
                <strong className='global-form-mandatory'> *</strong>
              </span>
              <input
                id='template_name'
                type='text'
                className='global-form-input'
                value={this.state.template_name}
                onChange={this.handleChange}
              />
            </div>

            <div className='global-form-buttons-container'>
              <button
                className='global-form-solid-button'
                onClick={() => {
                  this.updateParameterMessage();
                  this.updateActive();
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: '20px' }}>
          <div className='global-comp-form-container'>
            <span className='global-comp-title'>Credenciales Google Api</span>
            <div className='global-form-group'>
              <span className='global-form-label'>
                Token
                <strong className='global-form-mandatory'> *</strong>
              </span>
              <input
                id='tokenGoogle'
                type='text'
                className='global-form-input'
                value={this.state.tokenGoogle}
                onChange={this.handleChange}
              />
            </div>

            <span className='global-comp-title'>Bodega por defecto</span>
            <div className='global-form-group'>
              <span className='global-form-label'>
                Sede
              </span>
              <select
                id='sede'
                className='global-form-input-select'
                value={this.state.sede}
                onChange={this.handleChange}
              >
                <option value=''>Seleccione una sede...</option>
                {this.state.locations.map((location, index) => (
                  <option key={index} value={location.name}>{location.name}</option>
                ))}
              </select>
            </div>

            <div className='global-form-group'>
              <span className='global-form-label'>
                Sede ID
              </span>
              <input
                id='sede_id'
                className='global-form-input'
                type='text'
                readOnly // Esto hace que el input sea no editable
                value={this.state.sede_id}
                onChange={() => { }} // No permitas cambios en el input readonly
              />
            </div>

            <div className='global-form-buttons-container'>
              <button
                className='global-form-solid-button'
                onClick={() => {
                  this.updateTokenGoogle();
                  this.updateSede();
                }}              >
                Guardar
              </button>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: '20px' }}>
          <div className='global-comp-form-container'>
            <span className='global-comp-title'>Parámetros de sincronización</span>

            <div className='global-form-group'>
              <span className='global-form-label'>
                Hook Pedidos
              </span>
              <input
                id='active_hook'
                type='checkbox'
                style={{ marginTop: '20px' }}
                checked={this.state.active_hook}
                onChange={this.handleChange}
              />
            </div>

            <div className='global-form-group'>
              <span className='global-form-label'>
                Product/Proced
              </span>
              <input
                id='active_sync'
                type='checkbox'
                style={{ marginTop: '20px'}}
                checked={this.state.active_sync}
                onChange={this.handleChange}
              />
            </div>
            

            <div className='global-form-buttons-container'>
              <button
                className='global-form-solid-button'
                onClick={this.updateSync}
                >
                Guardar
              </button>
            </div>
          </div>
        </div>

      </div>
    )
  }
}

export default Parameters
