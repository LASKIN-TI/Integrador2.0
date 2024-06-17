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
  CITIES,
  CITIES_DEPARTMENTS,
  DEPARTMENTS,
  LIST_LOCATIONS,
  ERROR_MESSAGE,
  ALERT_TIMEOUT,
  COUNTRY,
  CREATE_DISPATCH,
} from '../../Functions/Constants'

class CreateUser extends Component {
  constructor() {
    super()
    this.state = {
      country: '',
      department: '',
      city: '',
      geolocation: false,
      departmentEnabled: false,
      cityEnabled: false,
      geolocationEnabled: false,

      sede_id: '',
      id_bodega: '',
      location: '',

      sede_id_default: '',
      id_bodega_default: '',
      location_default: '',

      latitude: '',
      longitude: '',

      cities: [],
      departments: [],
      locations: [],
      citiesdepartments: [],


      alert: '',
      timeout: '',
    }
  }

  componentDidMount() {
    getElements('cities', CITIES, this.setCities);
    getElements('departments', DEPARTMENTS, this.setDepartments);
    getElements('locations', LIST_LOCATIONS, this.setlocations);
    getElements('citiesdepartments', CITIES_DEPARTMENTS, this.setcitiesdepartments);

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



  componentWillUnmount() {
    clearTimeout(this.state.timeout)
  }

  // Functions to handle states
  handleChange = (event) => {
    let attribute = event.target.id;
    let value = event.target.value;

    // Si el atributo que se está cambiando es 'country' y el valor seleccionado es 'COLOMBIA'
    if (attribute === 'country' && value === 'COLOMBIA') {
      // Habilita los campos de Departamento, Ciudad y Geolocalizado
      this.setState({
        [attribute]: value,
        departmentEnabled: true,
        cityEnabled: true,
        geolocationEnabled: true,
      });
    } else {
      // Deshabilita los campos de Ciudad y Geolocalizado y limpia sus valores
      this.setState({
        [attribute]: value,
        // No es necesario limpiar los valores de país y departamento aquí, ya que queremos mantenerlos cuando se selecciona una ciudad
        // department: '', // Eliminamos esta línea para mantener el valor del departamento seleccionado
        // city: '', // No es necesario limpiar la ciudad aquí, ya que se actualizará automáticamente cuando se seleccione un departamento
        // geolocation: false, // No es necesario limpiar la geolocalización aquí, ya que se actualizará automáticamente cuando se seleccione un departamento
      });
    }

    if (attribute === 'location') { // Aquí cambia 'sede' a 'location'
      // Encuentra el ID correspondiente a la sede seleccionada
      const selectedLocation = this.state.locations.find(location => location.name === value);
      if (selectedLocation) {
        this.setState({
          [attribute]: value,
          sede_id: selectedLocation.id_sucursal,
          id_bodega: selectedLocation.location_id_reference,
        });
      }
    } else {
      this.setState({ [attribute]: value });
    }

    if (attribute === 'location_default') { // Aquí cambia 'sede' a 'location'
      // Encuentra el ID correspondiente a la sede seleccionada
      const selectedLocation = this.state.locations.find(location => location.name === value);
      if (selectedLocation) {
        this.setState({
          [attribute]: value,
          sede_id_default: selectedLocation.id_sucursal,
          id_bodega_default: selectedLocation.location_id_reference,
        });
      }
    } else {
      this.setState({ [attribute]: value });
    }
  };



  handleChangeDepartment = (event) => {
    const selectedDepartment = event.target.value;
    this.setState({ department: selectedDepartment });

    // Encuentra el objeto de departamento correspondiente en citiesdepartments
    const departmentData = this.state.citiesdepartments.find(
      (dep) => dep.department === selectedDepartment
    );

    if (departmentData) {
      const cities = departmentData.cities;
      const { city } = this.state;
      // Verifica si la ciudad seleccionada está presente en las ciudades disponibles para el departamento
      const cityIsValid = cities.includes(city);
      this.setState({ cities }, () => {
        // Si la ciudad seleccionada es válida, mantenla seleccionada
        if (cityIsValid) {
          this.setState({ city });
        }
      });
    } else {
      // Si no se encuentra el departamento, limpia las ciudades y la ciudad seleccionada
      this.setState({ cities: [], city: '' });
    }
  }


  handleChangeCheckbox = (event) => {
    const attribute = event.target.id;
    const value = event.target.checked; // Obtenemos el valor de checked, que es un booleano

    this.setState({ [attribute]: value });
  }

  clearInputs = () => {
    return this.setState({
      country: '',
      department: '',
      city: '',
      geolocation: '',
      location: '',
      sede_id: '',
      id_bodega: '',
      location_default: '',
      sede_id_default: '',
      id_bodega_default: '',
      latitude: '',
      longitude: ''
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
  responseHandler = (response, body) => {
    if (response === 'success') {
      this.buildAlert('success', 'Parámetro creado con éxito.');
      return this.clearInputs();
    } else if (body && body === '¡Error en el servidor!') {
      this.buildAlert('attention', '¡Error en el servidor!');
    } else if (body && body === 'No se puede geolocalizar y asignar sede a la vez') {
      this.buildAlert('attention', 'No se puede geolocalizar y asignar sede a la vez');
    } else {
      this.buildAlert('error', ERROR_MESSAGE);
    }
  };



  createDispatch = () => {
    this.close()

    let body = {
      country: this.state.country,
      department: this.state.department,
      city: this.state.city,
      geolocation: this.state.geolocation,
      location: this.state.location,
      id_sucursal: this.state.sede_id,
      id_bodega: this.state.id_bodega,
      location_default: this.state.location_default,
      id_sucursal_default: this.state.sede_id_default,
      id_bodega_default: this.state.id_bodega_default,
      latitude: this.state.latitude,
      longitude: this.state.longitude
    }

    console.log(body);
    return simpleRequest(CREATE_DISPATCH, 'POST', body, this.responseHandler)
  }

  // Auxiliary functions
  checkMandatoryInputs() {
    if (!this.state.email) {
      return false
    }


    return true
  }

  render() {
    return (
      <div className='cu-container'>
        {this.state.alert}
        <span className='global-comp-title'>Crear Parametro de envío</span>
        <span className='global-comp-description'>
          Diligencie el formulario para crear una nueva parametrización de envío. Todos los campos son obligatorios.
        </span>
        <div className='global-comp-form-container'>
          <div className='global-form-group'>
            <span className='global-form-label'>
              Pais
              <strong className='global-form-mandatory'> *</strong>
            </span>
            <select
              id='country'
              className='global-form-input-select'
              value={this.state.country}
              onChange={this.handleChange}
            >
              <option
                className='global-form-input-select-option'
                value=''
                disabled={true}
              >
                Seleccione un pais...
              </option>
              {setSelectOptions(COUNTRY)}
            </select>
          </div>

          <div className='global-form-group'>
            <span className='global-form-label'>
              Departamento
            </span>

            <select
              id='department'
              className='global-form-input-select'
              value={this.state.department}
              onChange={this.handleChangeDepartment}
              disabled={!this.state.departmentEnabled} // Cambiado aquí
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
            </span>
            <select
              id='city'
              className='global-form-input-select'
              value={this.state.city}
              onChange={this.handleChange}
              disabled={!this.state.cityEnabled} // Cambiado aquí
            >
              <option value='' disabled={true}>Seleccione una ciudad...</option>
              {this.state.cities.map((city, index) => (
                <option key={index} value={city}>{city}</option>
              ))}
            </select>

          </div>

          <div className='global-form-group'>
            <span className='global-form-label'>
              Geolocalizado
              <strong className='global-form-mandatory'> *</strong>
            </span>
            <input
              id='geolocation'
              type='checkbox'
              checked={this.state.geolocation}
              onChange={this.handleChangeCheckbox}
              disabled={!this.state.geolocationEnabled} // Cambiado aquí
            />


          </div>

          <div className='global-form-group'>
            <span className='global-form-label'>
              Sede
            </span>
            <select
              id='location'
              className='global-form-input-select'
              value={this.state.location}
              onChange={this.handleChange}
              disabled={this.state.geolocation} // Aquí aplicamos la lógica para deshabilitar cuando geolocalizado está marcado
            >
              <option value='' disabled={true}>Seleccione una sede...</option>
              {this.state.locations.map((location, index) => (
                <option key={index} value={location.name}>{location.name}</option>
              ))}
            </select>

          </div>

          <div
            style={{ display: 'none' }}
            className='global-form-group'>
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

          <div
            style={{ display: 'none' }}
            className='global-form-group'>
            <span className='global-form-label'>
              Bodega ID
            </span>
            <input
              id='id_bodega'
              className='global-form-input'
              type='text'
              readOnly // Esto hace que el input sea no editable
              value={this.state.id_bodega}
              onChange={() => { }} // No permitas cambios en el input readonly
            />
          </div>

          <span className='global-comp-sub-title'>Configuración por coordenadas (Opcional)</span>

          <div className='global-form-group'>
            <span className='global-form-label'>
              Latitud
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
            </span>
            <input
              id='longitude'
              type='text'
              className='global-form-input'
              value={this.state.longitude}
              onChange={this.handleChange}
            />
          </div>

          <div
            className='global-form-group'>
            <span className='global-form-label'>
              Sede por defecto
            </span>
            <select
              id='location_default'
              className='global-form-input-select'
              value={this.state.location_default}
              onChange={this.handleChange}
            >
              <option value=''>Seleccione una sede...</option>
              {this.state.locations.map((location, index) => (
                <option key={index} value={location.name}>{location.name}</option>
              ))}
            </select>

          </div>

          <div
            style={{ display: 'none' }}
            className='global-form-group'>
            <span className='global-form-label'>
              Sede ID
            </span>
            <input
              id='sede_id_default'
              className='global-form-input'
              type='text'
              readOnly // Esto hace que el input sea no editable
              value={this.state.sede_id_default}
              onChange={() => { }} // No permitas cambios en el input readonly
            />
          </div>

          <div
            style={{ display: 'none' }}
            className='global-form-group'>
            <span className='global-form-label'>
              Bodega ID
            </span>
            <input
              id='id_bodega_default'
              className='global-form-input'
              type='text'
              readOnly // Esto hace que el input sea no editable
              value={this.state.id_bodega_default}
              onChange={() => { }} // No permitas cambios en el input readonly
            />
          </div>


          <div className='global-form-buttons-container'>
            <button
              className='global-form-solid-button'
              onClick={this.createDispatch}
            >
              Guardar
            </button>
            <button
              className='global-form-outline-button'
              onClick={this.clearInputs}
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default CreateUser;