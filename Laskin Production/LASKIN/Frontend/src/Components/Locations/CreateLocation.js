import React, { Component } from 'react'
import './Styles.css'
import { getElements } from '../../Functions/Get'
import Alert from '../Alerts/Alert'
import {
  validateString,
  validateEmail,
  setSelectOptions,
} from '../../Functions/Helpers'
import { simpleRequest } from '../../Functions/Post'
import {
  MANDATORY_MESSAGE,
  CITIES,
  CITIES_DEPARTMENTS,
  DEPARTMENTS,
  EMAIL_MESSAGE,
  ERROR_MESSAGE,
  ALERT_TIMEOUT,
  INVALID_STRING_MESSAGE,
  CREATE_LOCATIONS,
} from '../../Functions/Constants'

class CreateUser extends Component {
  constructor() {
    super()
    this.state = {
      name: '',
      active: false,
      default: false,
      no_stock: false,
      latitude: '',
      longitude: '',
      start_laboral: '',
      end_laboral: '',
      tel_sede: '',
      template_name: '',
      department: '',
      city: '',
      id_sucursal: '',
      location_id_reference: '',

      latitud: '',
      longitud: '',


      cities: [],
      departments: [],
      citiesdepartments: [],



      alert: '',
      timeout: '',
    }
  }

  componentDidMount() {
    getElements('cities', CITIES, this.setCities);
    getElements('departments', DEPARTMENTS, this.setDepartments);
    getElements('citiesdepartments', CITIES_DEPARTMENTS, this.setcitiesdepartments);
  }

  componentWillUnmount() {
    clearTimeout(this.state.timeout)
  }

  handleChange = (event) => {
    const attribute = event.target.id;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
  
    this.setState({ [attribute]: value });
  }

  handleChangeDepartment = (event) => {
    const selectedDepartment = event.target.value;
    this.setState({ department: selectedDepartment });

    // Encuentra el objeto de departamento correspondiente en citiesdepartments
    const departmentData = this.state.citiesdepartments.find(
      (dep) => dep.department === selectedDepartment
    );

    if (departmentData) {
      const cities = departmentData.cities;
      this.setState({ cities });
    } else {
      // Si no se encuentra el departamento, limpia las ciudades
      this.setState({ cities: [] });
    }
  }

  setCities = async (response, body) => {
    if (response === 'success') {
      const cities = body.cities.map((cityObj) => cityObj.city);
      cities.sort();
      this.setState({ cities }, () => {
      });
    } else if (body === NO_ITEMS_ERROR) {
      this.buildAlert('attention', NO_ITEM_MESSAGE);
    } else {
      this.buildAlert('error', ERROR_MESSAGE);
    }
  };

  setDepartments = async (response, body) => {
    if (response === 'success') {
      const departments = body.departments.map((departmentObj) => departmentObj.department);

      departments.sort();
      this.setState({ departments }, () => {
      });

      //console.log(departments);
    } else if (body === NO_ITEMS_ERROR) {
      this.buildAlert('attention', NO_ITEM_MESSAGE);
    } else {
      this.buildAlert('error', ERROR_MESSAGE);
    }
  };

  setcitiesdepartments = async (response, body) => {
    if (response === 'success') {
      // Transforma el objeto JSON en el formato que necesitas para el estado
      const citiesdepartments = Object.keys(body).map(department => ({
        department,
        cities: body[department].map(city => city.desc_city)
      }));
      //console.log(citiesdepartments);
      this.setState({ citiesdepartments });
      //return this.buildAlert('success', 'Formularios listados correctamente')
    } else {
      this.setState({ citiesdepartments: [] })
      if (body === NO_ITEMS_ERROR) {
        return this.buildAlert('attention', NO_ITEM_MESSAGE)
      }

      return this.buildAlert('error', ERROR_MESSAGE)
    }
  };

  

  clearInputs = () => {
    return this.setState({
      name: '',
      active: false,
      default: false,
      no_stock: false,
      latitude: '',
      longitude: '',
      start_laboral: '',
      end_laboral: '',
      tel_sede: '',
      template_name: '',
      department: '',
      city: '',
      id_sucursal: '',
      location_id_reference: '',
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

  responseHandler = (response, body) => {
    if (response === 'success') {
      this.buildAlert('success', 'Sede creada con éxito.')

      return this.clearInputs()
    }

    return this.buildAlert('error', ERROR_MESSAGE)
  }

  createUser = () => {
    this.close()

    if (!this.checkMandatoryInputs()) {
      setTimeout(() => this.buildAlert('attention', MANDATORY_MESSAGE), 10)
      return
    }

    const body = {
      name: this.state.name,
      active: false,
      default: false,
      no_stock: false,
      latitude: this.state.latitude,
      longitude: this.state.longitude,
      start_laboral: this.state.start_laboral,
      end_laboral: this.state.end_laboral,
      tel_sede: this.state.tel_sede,
      template_name: this.state.template_name,
      department: this.state.department,
      city: this.state.city,
      id_sucursal: this.state.id_sucursal,
      location_id_reference: this.state.location_id_reference,
    }

    //console.log(body);

    return simpleRequest(CREATE_LOCATIONS, 'POST', body, this.responseHandler)
  }

  checkMandatoryInputs() {
    if (!this.state.name) {
      return false
    }
    if (!this.state.latitude) {
      return false
    }
    if (!this.state.longitude) {
      return false
    }
    if (!this.state.start_laboral) {
      return false
    }
    if (!this.state.end_laboral) {
      return false
    }
    if (!this.state.tel_sede) {
      return false
    }
    if (!this.state.department) {
      return false
    }
    if (!this.state.city) {
      return false
    }
    if (!this.state.id_sucursal) {
      return false
    }
    return true
  }

  render() {
    return (
      <div className='cu-container'>
        {this.state.alert}
        <span className='global-comp-title'>Crear sede</span>
        <span className='global-comp-description'>
          Diligencie el formulario para crear una nueva sede. Todos los campos
          son obligatorios.
        </span>

        <div className='global-comp-form-container'>

          <div className='global-form-group'>
            <span className='global-form-label'>
              Nombre de la sede
              <strong className='global-form-mandatory'> *</strong>
            </span>
            <input
              id='name'
              type='text'
              className='global-form-input'
              value={this.state.name}
              onChange={this.handleChange}
            />
          </div>

          <div className='global-form-group'>
            <span className='global-form-label'>
              ID Sucursal
              <strong className='global-form-mandatory'> *</strong>
            </span>
            <input
              id='id_sucursal'
              type='text'
              className='global-form-input'
              value={this.state.id_sucursal}
              onChange={this.handleChange}
            />
          </div>

          <div className='global-form-group'>
            <span className='global-form-label'>
              ID Bodega
              <strong className='global-form-mandatory'> *</strong>
            </span>
            <input
              id='location_id_reference'
              type='text'
              className='global-form-input'
              value={this.state.location_id_reference}
              onChange={this.handleChange}
            />
          </div>

          <div className='global-form-group'>
            <span className='global-form-label'>
              Latitud
              <strong className='global-form-mandatory'> *</strong>
            </span>
            <input
              id='latitude'
              type='text'
              className='global-form-input'
              value={this.state.latitude}
              onChange={this.handleChange}
            />
          </div>

          <div className='global-form-group'>
            <span className='global-form-label'>
              Longitud
              <strong className='global-form-mandatory'> *</strong>
            </span>
            <input
              id='longitude'
              type='text'
              className='global-form-input'
              value={this.state.longitude}
              onChange={this.handleChange}
            />
          </div>

          <div className='global-form-group'>
            <span className='global-form-label'>
              Inicio hora laboral
              <strong className='global-form-mandatory'> *</strong>
            </span>
            <input
              id='start_laboral'
              type='number'
              className='global-form-input'
              value={this.state.start_laboral}
              onChange={this.handleChange}
            />
          </div>

          <div className='global-form-group'>
            <span className='global-form-label'>
              Fin hora laboral
              <strong className='global-form-mandatory'> *</strong>
            </span>
            <input
              id='end_laboral'
              type='number'
              className='global-form-input'
              value={this.state.end_laboral}
              onChange={this.handleChange}
            />
          </div>

          <div className='global-form-group'>
            <span className='global-form-label'>
              Teléfono de la sede (con prefijo)
              <strong className='global-form-mandatory'> *</strong>
            </span>
            <input
              id='tel_sede'
              type='text'
              className='global-form-input'
              value={this.state.tel_sede}
              placeholder='573211234567 (con prefijo)'
              onChange={this.handleChange}
            />
          </div>

          <div className='global-form-group'>
            <span className='global-form-label'>
              Departamento
              <strong className='global-form-mandatory'> *</strong>
            </span>
            <select
              id='department'
              className='global-form-input-select'
              value={this.state.department}
              onChange={this.handleChangeDepartment}
            >
              <option value='' disabled={true}>Selecciona un departamento...</option>
              {this.state.departments.map((department, index) => (
                <option key={index} value={department}>{department}</option>
              ))}
            </select>

          </div>

          
          <div className='global-form-group'>
            <span className='global-form-label'>
              Ciudad
              <strong className='global-form-mandatory'> *</strong>
            </span>
            <select
              id='city'
              className='global-form-input-select'
              value={this.state.city}
              onChange={this.handleChange}
            >
              <option value='' disabled={true}>Seleccione una ciudad...</option>
              {this.state.cities.map((city, index) => (
                <option key={index} value={city}>{city}</option>
              ))}
            </select>

          </div>


          {/* <div className='global-form-group'>
            <span className='global-form-label'>
              Activa
              <strong className='global-form-mandatory'> *</strong>
            </span>
            <input
              id='active'
              type='checkbox'
              checked={this.state.active}
              onChange={this.handleChange}
            />
          </div> */}

          {/* <div className='global-form-group'>
            <span className='global-form-label'>
              Por defecto
              <strong className='global-form-mandatory'> *</strong>
            </span>
            <input
              id='default'
              type='checkbox'
              checked={this.state.default}
              onChange={this.handleChange}
            />
          </div> */}

          {/* <div className='global-form-group'>
            <span className='global-form-label'>
              Vende sin stock
              <strong className='global-form-mandatory'> *</strong>
            </span>
            <input
              id='no_stock'
              type='checkbox'
              checked={this.state.no_stock}
              onChange={this.handleChange}
            />
          </div>
 */}

          <div className='global-form-buttons-container'>
            <button
              className='global-form-solid-button'
              onClick={this.createUser}
            >
              Guardar
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

export default CreateUser
