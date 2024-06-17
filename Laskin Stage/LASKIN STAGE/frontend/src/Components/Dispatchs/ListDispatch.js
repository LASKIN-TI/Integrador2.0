import React, { Component } from 'react'
import './Styles.css'

import Alert from '../Alerts/Alert'
import { getElements } from '../../Functions/Get'
import { simpleRequest } from '../../Functions/Post'
import { simpleAlert3 } from '../../Functions/SwalAlert'
import { setSelectOptions } from '../../Functions/Helpers'
import {
  LIST_DISPATCH,
  ALERT_TIMEOUT,
  NO_ITEMS_ERROR,
  NO_ITEM_MESSAGE,
  ERROR_MESSAGE,
  DELETE_DISPATCH,
  CONFIRM_DELETE_DISPATCH,
  COUNTRY,
  DEPARTMENTS,
  CITIES,
  LIST_LOCATIONS
} from '../../Functions/Constants'

class ListDispatches extends Component {
  constructor() {
    super()
    this.state = {
      dispatches: [],

      currentPage: 1,
      totalPages: 1,
      selectedPage: 1,

      country: '',
      department: '',
      des_city: '',
      location: '',

      departments: [],
      cities: [],
      locations: [],



      // Auxiliary form states
      alert: '',
      timeout: '',
    }
    this.refreshView = this.refreshView.bind(this);
  }

  componentDidMount() {
    getElements('dispatches', `${LIST_DISPATCH}?page=${this.state.currentPage}`, this.setDispatches)
    getElements('departments', DEPARTMENTS, this.setDepartments);
    getElements('cities', CITIES, this.setCities);
    getElements('locations', LIST_LOCATIONS, this.setLocations);

  }

  search = () => {
    const { currentPage, country, department, des_city, location } = this.state;

    // Construir la URL de la consulta incluyendo el nuevo parámetro department
    const url = `${LIST_DISPATCH}?page=${currentPage}&country=${country}&department=${department}&des_city=${des_city}&location=${location}`;
    getElements('dispatches', url, this.setDispatches);

    this.buildAlert('success', 'Se han aplicado los filtros.');
  };


  componentWillUnmount() {
    clearTimeout(this.state.timeout)
  }

  refreshView = () => {
    getElements('dispatches', `${LIST_DISPATCH}?page=${this.state.currentPage}`, this.setDispatches);
    this.clearInputs();
    this.buildAlert('success', 'La vista se ha refrescado.');
  };

  // Functions to handle states
  handleChange = (event) => {
    let attribute = event.target.id;
    let value = event.target.value;

    this.setState({ [attribute]: value });
  };

  handleSelectChange = (event) => {
    this.setState({ selectedOption: event.target.value });
  };

  handlePageChange = (event) => {
    const selectedPage = parseInt(event.target.value, 10);
    this.setState({ selectedPage, isLoading: true });
    getElements(
      'dispatches',
      `${LIST_DISPATCH}?page=${selectedPage}`,
      this.setDispatches,
      selectedPage
    );
  };

  changePage = () => {
    const { selectedPage } = this.state;
    this.setState({ currentPage: selectedPage, isLoading: true });
    getElements('dispatches', `${LIST_DISPATCH}?page=${selectedPage}`, this.setDispatches, selectedPage);
  };

  routeEdit = (event) => {
    let id = event.target.id.split('-')
    sessionStorage.setItem('id', id[1])

    return this.props.changeSelected(24)
  }

  routeRemove = (event) => {
    let id = event.target.id.split('-')
    let body = {
      id: id[1]
    }
    //console.log(body);
    return simpleAlert3(CONFIRM_DELETE_DISPATCH, () => simpleRequest(DELETE_DISPATCH, 'DELETE', body, this.responseHandler));
  }

  responseHandler = (response, body) => {
    if (response == 'success') {
      getElements('dispatches', `${LIST_DISPATCH}?page=${this.state.currentPage}`, this.setDispatches)
      return this.buildAlert(
        'success',
        'La solicitud ha sido procesada exitosamente.'
      );
    }
    return this.buildAlert('error', ERROR_MESSAGE)
  }

  // Functions to handle requests
  setDispatches = async (response, body) => {
    if (response === 'success') {
      let dispatches = body.dispatches.map((dispatch) => ({
        ...dispatch,
      }));

      this.setState({
        dispatches,
        totalPages: body.totalPages,
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

  setCities = async (response, body) => {
    if (response === 'success') {
      const cities = body.cities.map((cityObj) => cityObj.c_city);
      cities.sort();
      this.setState({ cities }, () => {
      });
    } else if (body === NO_ITEMS_ERROR) {
      this.buildAlert('attention', NO_ITEM_MESSAGE);
    } else {
      this.buildAlert('error', ERROR_MESSAGE);
    }
  };

  setLocations = async (response, body) => {
    if (response === 'success') {
      const locations = body.map((locationObj) => locationObj.name);
      this.setState({ locations }, () => {
        console.log("Locations:", this.state.locations);
      });

    } else if (body === NO_ITEMS_ERROR) {
      this.buildAlert('attention', NO_ITEM_MESSAGE);
    } else {
      this.buildAlert('error', ERROR_MESSAGE);
    }
  };

  clearInputs = () => {
    this.setState({
      country: '',
      department: '',
      des_city: '',
      location: '',
    });
  };
  


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



  setTable() {
    let rows = this.state.dispatches

    if (rows.length < 1) {
      return (
        <span className='global-body-text' style={{ marginBottom: '0px' }}>
          Actualmente no hay parametrizaciones con los filtros seleccionados.
        </span>
      )
    }

    let table_rows = rows.map((obj, index) => (
      <tr key={'tr' + obj.id + index}>
        <td>{obj.id}</td>
        <td>{obj.country}</td>
        <td>{obj.department}</td>
        <td>{obj.city}</td>
        <td>
          <input
            type="checkbox"
            id={`active-${obj.id}`}
            checked={obj.geolocation}
            onChange={(e) => this.handleCheckboxChange(e, 'geolocation')}
          />
        </td>
        <td>{obj.location}</td>
        <td>{obj.lat && obj.lng ? `${obj.lat},${obj.lng}` : obj.lat || obj.lng || ''}</td>
        <td>{obj.location_default}</td>
        <td>
          <span
            id={'e-' + obj.id}
            className='global-table-link'
            onClick={this.routeEdit}
            style={{ marginRight: '10px' }}
          >
            Editar
          </span>
          {window.sessionStorage.getItem("user_id") != obj.id &&
            <span
              id={'e-' + obj.id}
              className='global-table-link'
              onClick={this.routeRemove}
            >
              Eliminar
            </span>
          }
        </td>
      </tr>
    ));

    let table = (
      <table>
        <tbody>
          <tr>
            <th>ID</th>
            <th>País</th>
            <th>Departamento</th>
            <th>Ciudad</th>
            <th>Geolocalizado</th>
            <th>Sede</th>
            <th>Coordenadas para ciudad</th>
            <th>Sede para coordenadas</th>
          </tr>
          {table_rows}
        </tbody>
      </table>
    )

    return table
  }

  render() {
    const { isLoading, selectedPage, totalPages, selectedOption } = this.state;

    if (isLoading) {
      return (
        <div className="cu-container">
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        </div>
      );
    }

    let table = this.setTable()

    return (
      <div className='cu-container'>
        {this.state.alert}
        <span className='global-comp-title'>Lista de parametrizaciones</span>
        <span className='global-comp-description'>
          Aquí podrá listar todas las parametrizaciones configuradas para los envíos.
          Utilice las listas desplegables para filtrar los elementos.
        </span>
        <div className='global-comp-form-container'>

          <div className='global-special-form-group'>
            <div className="actions-container">

              <div className="filter-container">
                <label className='global-comp-description'>Seleccione el pais:</label>
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

              <div className="filter-container">
                <label className='global-comp-description'>Seleccione el departamento:</label>
                <select
                  id='department'
                  className='global-form-input-select'
                  value={this.state.department}
                  onChange={this.handleChange} // Añadido
                >
                  <option value=''>Selecciona un departamento...</option>
                  {this.state.departments.map((department, index) => (
                    <option key={index} value={department}>{department}</option>
                  ))}
                </select>

              </div>

              <div className="filter-container">
                <label className='global-comp-description'>Seleccione la ciudad:</label>
                <select
                  id='des_city'
                  className='global-form-input-select'
                  value={this.state.des_city}
                  onChange={this.handleChange} // Añadido
                >
                  <option value=''>Selecciona una ciudad...</option>
                  {this.state.cities.map((city, index) => (
                    <option key={index} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="filter-container">
                <label className='global-comp-description'>Seleccione la sucursal:</label>
                <select
                  id='location'
                  className='global-form-input-select'
                  value={this.state.location}
                  onChange={this.handleChange} // Añadido
                >
                  <option value=''>Selecciona una sucursal...</option>
                  {this.state.locations.map((location, index) => (
                    <option key={index} value={location}>{location}</option>
                  ))}
                </select>
              </div>


            </div>

            <button
              className='global-form-solid-button sync-button'
              onClick={this.search}
            >
              Buscar
            </button>

            <button
              className='global-form-solid-button sync-button'
              onClick={this.refreshView}
            >
              Refrescar
            </button>

          </div>

          <div className='pagination-container'>

            <select
              value={selectedPage}
              onChange={this.handlePageChange}
            >
              {Array.from({ length: totalPages }, (_, index) => (
                <option key={index + 1} value={index + 1}>Página
                  {index + 1}
                </option>
              ))}
            </select>

          </div>


          <div className='table-container'>{table}</div>
        </div>
      </div>
    )
  }
}

export default ListDispatches
