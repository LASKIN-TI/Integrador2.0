import React, { Component } from 'react';
import './Styles.css';

import Alert from '../Alerts/Alert';
import { getElements, getElements3 } from '../../Functions/Get';
import { simpleRequest } from '../../Functions/Post';
import { simpleAlert } from '../../Functions/SwalAlert';
import { setSelectOptions } from '../../Functions/Helpers';
import Modal from './Modal';
import {
  LIST_LOCATIONS,
  ALERT_TIMEOUT,
  NO_ITEMS_ERROR,
  NO_ITEM_MESSAGE,
  ERROR_MESSAGE,
  MODIFY_LOCATION,
  SAVE_LOCATIONS
} from '../../Functions/Constants';

class ListLocations extends Component {
  constructor() {
    super();
    this.state = {
      locations: [],
      alert: '',
      timeout: '',
      selectedItems: [], // Array para almacenar los elementos seleccionados
    };
  }

  componentDidMount() {
    getElements('list', LIST_LOCATIONS, this.setlocations);
  }

  componentWillUnmount() {
    clearTimeout(this.state.timeout);
  }

  handleChange = (event) => {
    let attribute = event.target.id;
    let value = event.target.value;

    this.setState({ [attribute]: value });
  };

  handleCheckboxChange = (event, type) => {
    const { id } = event.target; // Obtener el ID del checkbox
    const isChecked = event.target.checked; // Obtener si el checkbox está marcado o desmarcado

    // Realizar acciones basadas en el tipo de cambio (type)
    switch (type) {
      case 'active':
        // Manejar el cambio del checkbox activo
        // Por ejemplo, puedes actualizar el estado para reflejar el cambio
        this.setState(prevState => ({
          locations: prevState.locations.map(location =>
            location.id === parseInt(id.split('-')[1])
              ? { ...location, active: isChecked }
              : location
          )
        }));
        break;
      case 'default':
        // Manejar el cambio del checkbox predeterminado
        this.setState(prevState => ({
          locations: prevState.locations.map(location =>
            location.id === parseInt(id.split('-')[1])
              ? { ...location, default: isChecked }
              : location
          )
        }));
        break;
      case 'no_stock':
        // Manejar el cambio del checkbox de no stock
        this.setState(prevState => ({
          locations: prevState.locations.map(location =>
            location.id === parseInt(id.split('-')[1])
              ? { ...location, no_stock: isChecked }
              : location
          )
        }));
        break;
      // Puedes agregar más casos aquí si necesitas manejar otros tipos de checkboxes
      default:
      // Manejar otros tipos de cambio si es necesario
    }
  };


  routeEdit = (event) => {
    let id = event.target.id.split('-');
    sessionStorage.setItem('id', id[1]);

    return this.props.changeSelected(23);
  };

  saveLocations = () => {
    this.close(); // Cerrar alguna ventana o modal si es necesario    
    // Realizar la solicitud al servidor en segundo plano
    return getElements3(SAVE_LOCATIONS, 'GET', this.responseHandler2); // Llama a la función getElements
  }

  routeSave = (id) => {
    let path = MODIFY_LOCATION + '/' + id; // Concatena el ID del formulario a la ruta base
    let location = this.state.locations.find(location => location.id === id);
    let data = {
      id: id,
      active: location.active,
      default: location.default,
      no_stock: location.no_stock
    };

    //console.log(data);
    return simpleRequest(path, 'PUT', data, this.responseHandler);
  };


  responseHandler = (response, body) => {
    if (response === 'success') {
      getElements('locations', LIST_LOCATIONS, this.setlocations);
      return this.buildAlert(
        'success',
        'La solicitud ha sido procesada exitosamente.'
      );
    }

    if (body == 'Ya hay una sede predeterminada') {
      return this.buildAlert('attention', body);
    }

    return this.buildAlert('error', ERROR_MESSAGE);
  };

  responseHandler2 = (response, body) => {
    if (response === 'success') {
      this.buildAlert('success', 'Se están sincronizando las sedes');
    } else {
      this.buildAlert('error', ERROR_MESSAGE);
    }
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

  showModal(latitude, longitude, start_laboral, end_laboral, tel_sede, template_name, id_sucursal, location_id_reference) {
    return this.props.showModal(
      <Modal latitude={latitude} longitude={longitude} start_laboral={start_laboral} end_laboral={end_laboral} tel_sede={tel_sede} template_name={template_name} id_sucursal={id_sucursal} location_id_reference= {location_id_reference} closeModal={this.closeModal} />
    )
  }

  closeModal = () => {
    return this.props.closeModal()
  }


  setTable() {
    let rows = this.state.locations;

    let table_rows = [];
    for (let i = 0; i < rows.length; i++) {
      let obj = rows[i];

      table_rows.push(
        <tr key={'tr' + obj.id}>
          <td>{obj.id}</td>
          <td>{obj.name}</td>
          {/*           <td>{obj.location_id_reference}</td>
 */}          <td>
            <input
              type="checkbox"
              id={`active-${obj.id}`}
              checked={obj.active}
              onChange={(e) => this.handleCheckboxChange(e, 'active')}
            />
          </td>
          <td>
            <input
              type="checkbox"
              id={`default-${obj.id}`}
              checked={obj.default}
              onChange={(e) => this.handleCheckboxChange(e, 'default')}
            />
          </td>
          <td>
            <input
              type="checkbox"
              id={`no_stock-${obj.id}`}
              checked={obj.no_stock}
              onChange={(e) => this.handleCheckboxChange(e, 'no_stock')}
            />
          </td>
          <td>
            <span
              id={'e-' + obj.id}
              className="global-table-link"
              onClick={() => this.routeSave(obj.id)}
              style={{ marginRight: '10px' }}

            >
              Guardar
            </span>
            <span
              id={'e-' + obj.id}
              className='global-table-link'
              onClick={this.routeEdit}
              style={{ marginRight: '10px' }}
            >
              Editar
            </span>
            <span
              className="global-table-link"
              onClick={() => this.showModal(obj.latitude, obj.longitude, obj.start_laboral, obj.end_laboral, obj.tel_sede, obj.template_name, obj.id_sucursal, obj.location_id_reference)}
            >
              Detalles
            </span>
          </td>
        </tr>
      );
    }

    let table = (
      <table>
        <tbody>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            {/*             <th>ID Sede</th>
 */}            <th>Activa</th>
            <th>Predeterminada</th>
            <th>Vende sin Stock</th>
            <th>Acciones</th>
          </tr>
          {table_rows}
        </tbody>
      </table>
    );

    return table;
  }


  render() {
    let table = this.setTable();

    return (
      <div className="cu-container">
        {this.state.alert}
        <span className="global-comp-title">Lista de sedes</span>
        <span className="global-comp-description">
          Aquí podrá listar todas las sedes de la aplicación.
        </span>
        <div className="global-comp-form-container">
          <button
            className='global-form-solid-button sync-button'
            onClick={this.saveLocations}
          >
            Sincronizar
          </button>
          <div className='table-container'>{table}</div>
        </div>
      </div>
    );
  }
}

export default ListLocations;
