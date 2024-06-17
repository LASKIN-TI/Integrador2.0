import React, { Component } from 'react';
import './Styles.css';
import Alert from '../Alerts/Alert';
import { getElements, downloadExcel2 } from '../../Functions/Get';
import {
  LIST_RECORDS,
  ERROR_MESSAGE,
  ALERT_TIMEOUT,
  NO_ITEMS_ERROR,
  RECORDS_EXCEL
} from '../../Functions/Constants';
import { formatPrice } from '../../Functions/Helpers';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import { format } from 'date-fns';

registerLocale('es', es);

class ListRecords extends Component {
  constructor() {
    super();
    this.state = {
      records: [],
      alert: null,
      timeout: null,
      currentPage: 1,
      totalPages: 1,
      selectedPage: 1,
      isLoading: false,

      startDate: null,
      endDate: null,
      sku: '',
      productType: '',
      message: ''

    };
    this.refreshView = this.refreshView.bind(this);
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
  }


  componentDidMount() {
    let session_id = sessionStorage.getItem('user_id');
    getElements('records', `${LIST_RECORDS}?page=${this.state.currentPage}`, this.setRecords, this.state.currentPage);
  }

  search = () => {
    const { currentPage, startDate, endDate, sku, productType, message } = this.state;

    // Formatear las fechas a 'yyyy.MM.dd HH:mm:ss'
    const formattedStartDate = startDate ? format(startDate, "yyyy.MM.dd 00:00:00") : '';
    const formattedEndDate = endDate ? format(endDate, "yyyy.MM.dd 23:59:59") : '';

    // Construir la URL de la consulta incluyendo el nuevo parámetro id_shopify
    const url = `${LIST_RECORDS}?page=${currentPage}&dateFrom=${formattedStartDate}&dateTo=${formattedEndDate}&sku=${sku}&product_type=${productType}&message=${message}`;
    getElements('records', url, this.setRecords);

    //this.clearInputs();
    this.buildAlert('success', 'Se han aplicado los filtros.');
  };

  clearInputs = () => {
    return this.setState({
      startDate: '',
      endDate: '',
      sku: '',
    });
  }

  componentWillUnmount() {
    clearTimeout(this.state.timeout);
  }


  refreshView = () => {
    getElements('records', `${LIST_RECORDS}?page=${this.state.currentPage}`, this.setRecords);
    this.buildAlert('success', 'La vista se ha refrescado.');
  };

  handleChange = (event) => {
    let attribute = event.target.id;
    let value = event.target.value;

    this.setState({ [attribute]: value });
  };

  handleSelectChange = (event) => {
    this.setState({ selectedOption: event.target.value });
  };

  handleProductTypeChange = (event) => {
    const value = event.target.value === 'todos' ? '' : event.target.value;
    this.setState({ productType: value });
  };

  handleMessageTypeChange = (event) => {
    const value = event.target.value === 'todos' ? '' : event.target.value;
    this.setState({ message: value });
  };


  handleStartDateChange = (date) => {
    this.setState({ startDate: date });
  };

  handleEndDateChange = (date) => {
    this.setState({ endDate: date });
  };

  handlePageChange = (event) => {
    const selectedPage = parseInt(event.target.value, 10);
    this.setState({ selectedPage, isLoading: true });
    getElements(
      'records',
      `${LIST_RECORDS}?page=${selectedPage}`,
      this.setRecords,
      selectedPage
    );
  };


  // Functions related to requests
  responseHandler = (response, body) => {
    if (response === 'success') {
      getElements('records', `${LIST_RECORDS}?page=${this.state.currentPage}`, this.setRecords);
      return this.buildAlert(
        'success',
        'La solicitud ha sido procesada exitosamente.'
      );
    }
    return this.buildAlert('error', ERROR_MESSAGE);
  };

  setRecords = async (response, body) => {
    this.setState({ isLoading: false });
    if (response === 'success') {
      let records = body.records.map((product) => ({
        ...product,
      }));

      this.setState({
        records,
        totalPages: body.totalPages,
      });
    } else if (body === NO_ITEMS_ERROR) {
      this.buildAlert('attention', NO_ITEM_MESSAGE);
    } else {
      this.buildAlert('error', ERROR_MESSAGE);
    }
  };

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
  };

  changePage = () => {
    const { selectedPage } = this.state;
    this.setState({ currentPage: selectedPage, isLoading: true });
    getElements('records', `${LIST_RECORDS}?page=${selectedPage}`, this.setRecords, selectedPage);
  };

  exportExcel = () => {
    const { startDate, endDate, sku, productType, message } = this.state;
  
    // Formatear las fechas a 'yyyy.MM.dd HH:mm:ss'
    const formattedStartDate = startDate ? format(startDate, "yyyy.MM.dd HH:mm:ss") : '';
    const formattedEndDate = endDate ? format(endDate, "yyyy.MM.dd HH:mm:ss") : '';
  
    // Construir la URL de la consulta incluyendo los parámetros de filtro
    const url = `${RECORDS_EXCEL}?dateFrom=${formattedStartDate}&dateTo=${formattedEndDate}&sku=${sku}&product_type=${productType}&message=${message}`;
  
    // Llama a la función downloadExcel2 con la URL construida
    downloadExcel2(url, (status, message) => {
      if (status === 'success') {
        this.buildAlert('success', message);
      } else {
        // Si la descarga falla, mostrar una alerta de error
        this.buildAlert('error', message);
      }
    });
  };
  


  setTable() {
    let rows = this.state.records

    if (rows.length < 1) {
      return (
        <span className='global-body-text' style={{ marginBottom: '0px' }}>
          Actualmente no hay productos con los filtros seleccionados.
        </span>
      );
    }

    let table_rows = rows.map((obj, index) => (
      <tr key={'tr' + obj.id + index}>
        <td>{this.formatDate(obj.createdAt)}</td>
        <td>{obj.id}</td>
        <td>{obj.variants[0].sku}</td>
        <td>{obj.message}</td>
        <td>{obj.title}</td>
        <td>{obj.vendor}</td>
        <td>{formatPrice(obj.variants[0].price)}</td>
        <td>{obj.variants[0].inventory_quantity}</td>
        <td>{obj.tags}</td>
      </tr>
    ));

    let table = (
      <table>
        <tbody>
          <tr>
            <th>Fecha</th>
            <th>ID</th>
            <th>SKU</th>
            <th>Acción</th>
            <th>Nombre</th>
            <th>Vendedor</th>
            <th>Precio</th>
            <th>Inventario</th>
            <th>Etiquetas</th>
          </tr>
          {table_rows}
        </tbody>
      </table>
    );

    return table;
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

    let table = this.setTable();

    return (
      <div className='cu-container'>
        {this.state.alert}
        <span className='global-comp-title'>Registros</span>
        <span className='global-comp-description'>
          Aquí podrá visualizar los últimos 5000 registros del sistema.
        </span>
        <span className='global-comp-description'>
          Estos incluyen: sincronizaciones realizadas desde el integrador (Manual y automáticas) y registros por pedidos, ya que cambia el stock
        </span>
        <div className='global-comp-form-container'>
          <div className='global-special-form-group'>
            <div className="actions-container">

              <div className="filter-container">
                <label className='global-comp-description'>Seleccione el estado:</label>
                <select
                  id='messageTypeFilter'
                  className='global-special-form-input-select'
                  onChange={this.handleMessageTypeChange}
                  value={this.state.messageTypeFilter}
                >
                  <option value='' disabled>Selecciona la acción realizada</option>
                  <option value='todos'>Todos</option>
                  <option value='Creado'>Creados</option>
                  <option value='Actualizado'>Actualizados</option>
                  <option value='Error en la creación del producto'>Error</option>
                </select>
              </div>

              <div className="filter-container">
                <label className='global-comp-description'>Seleccione el tipo:</label>
                <select
                  id='productTypeFilter'
                  className='global-special-form-input-select'
                  onChange={this.handleProductTypeChange}
                  value={this.state.productTypeFilter}
                >
                  <option value='todos'>Todos</option>
                  <option value='PRODUCTO'>Productos</option>
                  <option value='PROCEDIMIENTO'>Procedimientos</option>
                </select>
              </div>

              <div className="filter-container">
                <label className='global-comp-description'>Buscar:</label>
                <input
                  type='text'
                  id='sku' // Cambiar de 'searchQuery' a 'sku'
                  className='global-form-input'
                  style={{ maxWidth: '250px' }}
                  placeholder='SKU'
                  value={this.state.sku} // Cambiar de 'searchQuery' a 'sku'
                  onChange={this.handleChange}
                />
              </div>

              <div className="filter-container">
                <label className='global-comp-description'>Fecha desde:</label>
                <DatePicker
                  selected={this.state.startDate}
                  onChange={this.handleStartDateChange}
                  placeholderText="Fecha desde"
                  className="global-form-input"
                  locale="es"
                  dateFormat="dd/MM/yyyy"
                />
              </div>

              <div className="filter-container">
                <label className='global-comp-description'>Fecha hasta:</label>
                <DatePicker
                  selected={this.state.endDate}
                  onChange={this.handleEndDateChange}
                  placeholderText="Fecha hasta"
                  className="global-form-input"
                  locale="es"
                  dateFormat="dd/MM/yyyy"
                />
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

            <button
              onClick={this.exportExcel}
              className={`global-form-solid-button green-button`}
              style={{ marginLeft: 'auto' }}
            >
              Exportar a Excel
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
    );
  }
}

export default ListRecords;
