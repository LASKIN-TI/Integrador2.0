import React, { Component } from 'react'
import './Styles.css'
import { getElements } from '../../Functions/Get'
import Alert from '../Alerts/Alert'
import {
  validateString,
  validateEmail,
  setSelectOptions,
} from '../../Functions/Helpers'
import { getElementById } from '../../Functions/Get'
import { simpleRequest } from '../../Functions/Post'
import {
  CITIES,
  CITIES_DEPARTMENTS,
  DEPARTMENTS,
  DETAIL_LOCATION,
  MANDATORY_MESSAGE,
  ERROR_MESSAGE,
  NO_ITEMS_ERROR,
  ALERT_TIMEOUT,
  INVALID_STRING_MESSAGE,
  MODIFY_LOCATION,
  UPDATE_LOCATION,

} from '../../Functions/Constants'

class ModifyLocation extends Component {
  constructor() {
    super()
    this.state = {
      id: 0,
      name: '',
      latitude: '',
      longitude: '',
      start_laboral: '',
      end_laboral: '',
      tel_sede: '',
      template_name: '',
      location_id_reference: '',
      id_sucursal: '',
      department: '',
      city: '',

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

    let session_id = sessionStorage.getItem('id')
    if (session_id && session_id > 0) {
      this.setState({ id: parseInt(session_id) })
      sessionStorage.removeItem('id')

      return getElementById(
        DETAIL_LOCATION + '?id=' + session_id,
        this.setLocationInfo
      )
    }
    return
  }

  componentWillUnmount() {
    clearTimeout(this.state.timeout)
  }

  handleChange = (event) => {
    let attribute = event.target.id
    let value = event.target.value

    switch (attribute) {
      case 'id':
        if (value > 0) {
          getElementById(DETAIL_LOCATION + '?id=' + value, this.setLocationInfo)
        }
        break
    }

    return this.setState({ [attribute]: value })
  }


  clearInputs = () => {
    return this.setState({
      id: 0,
      name: '',
      latitude: '',
      longitude: '',
      start_laboral: '',
      end_laboral: '',
      tel_sede: '',
      template_name: '',
      location_id_reference: '',
      id_sucursal: '',
      department: '',
      city: '',

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

  setLocationInfo = (response, body) => {
    if (response === 'success') {
      this.setState({
        name: body.rows[0].name,
        latitude: body.rows[0].latitude,
        longitude: body.rows[0].longitude,
        start_laboral: body.rows[0].start_laboral,
        end_laboral: body.rows[0].end_laboral,
        tel_sede: body.rows[0].tel_sede,
        template_name: body.rows[0].template_name,
        location_id_reference: body.rows[0].location_id_reference,
        id_sucursal: body.rows[0].id_sucursal,
        department: body.rows[0].state,
        city: body.rows[0].city
      })
      return this.buildAlert('success', 'Información de la sede recuperada.')
    }

    this.clearInputs()

    if (body == NO_ITEMS_ERROR) {
      return this.buildAlert(
        'attention',
        'No se ha encontrado una sede con ese ID. Por favor intente con otro.'
      )
    }

    return this.buildAlert('error', ERROR_MESSAGE)
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


  responseHandler = (response, body) => {
    if (response == 'success') {
      sessionStorage.removeItem('users')
      this.buildAlert('success', 'Sede modificada con éxito.')

      return this.clearInputs()
    }

    return this.buildAlert('error', ERROR_MESSAGE)
  }

  ModifyLocation = () => {
    this.close()

    if (!this.checkMandatoryInputs()) {
      setTimeout(() => this.buildAlert('attention', MANDATORY_MESSAGE), 10)
      return
    }

    if (
      !validateString(this.state.name) ||
      !validateString(this.state.latitude) ||
      !validateString(this.state.longitude)
    ) {
      setTimeout(() => this.buildAlert('attention', INVALID_STRING_MESSAGE), 10)
      return
    }

    const body = {
      id: this.state.id,
      name: this.state.name,
      latitude: this.state.latitude,
      longitude: this.state.longitude,
      start_laboral: this.state.start_laboral,
      end_laboral: this.state.end_laboral,
      tel_sede: this.state.tel_sede,
      template_name: this.state.template_name,
      location_id_reference: this.state.location_id_reference,
      id_sucursal: this.state.id_sucursal,
      department: this.state.department,
      city: this.state.city
    }

    console.log(body);

    return simpleRequest(UPDATE_LOCATION, 'PUT', body, this.responseHandler)
  }

  checkMandatoryInputs() {
    /*  if (!this.state.name) {
       return false
     } */

    return true
  }

  render() {
    return (
      <div className='cu-container'>
        {this.state.alert}
        <span className='global-comp-title'>Modificar Sede</span>
        <span className='global-comp-description'>
          Diligencie el formulario para editar una sede. Puede especificar el
          ID o seleccionar la acción de editar en la opción de listar sedes
          del menú lateral.
        </span>

        <div className='global-comp-form-container'>
        <span className='global-comp-sub-title'>ESPECIFIQUE LA SEDE</span>
        <span className='global-body-text'>
            Si fue redirigido a través de la opción listar sedes, el
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
          <span className='global-comp-sub-title'>EDITE LA SEDE</span>

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
              Teléfono de la sede
              <strong className='global-form-mandatory'> *</strong>
            </span>
            <input
              id='tel_sede'
              type='text'
              className='global-form-input'
              value={this.state.tel_sede}
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


          <div className='global-form-buttons-container'>
            <button
              className='global-form-solid-button'
              onClick={this.ModifyLocation}
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

export default ModifyLocation
