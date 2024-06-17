import React, { Component } from 'react';
import './Styles.css';
import Alert from '../Alerts/Alert';
import { getElements } from '../../Functions/Get';
import * as XLSX from 'xlsx';
import {
  LIST_PROCEDURES,
  ERROR_MESSAGE,
  ALERT_TIMEOUT,
  NO_ITEMS_ERROR,
  DATE_PROCEDURES
} from '../../Functions/Constants';

class ListProcedures extends Component {
  constructor() {
    super();
    this.state = {
      procedures: [],
      alert: null,
      timeout: null,

      currentPage: 1,
      totalPages: 1,
      selectedPage: 1,
      isLoading: false,

      sku: '',

      date_rabbit: '',
      responsible: '',
      searchQuery: '',
    };
  }

  componentDidMount() {
    let session_id = sessionStorage.getItem('user_id');
    this.setState({ isLoading: true });
    getElements('procedures', `${LIST_PROCEDURES}?page=${this.state.currentPage}`, this.setProcedures, this.state.currentPage);
    getElements('dateProcedures', DATE_PROCEDURES, this.setDateProcedures);
  }

  search = () => {
    const { currentPage, sku } = this.state;

    const url = `${LIST_PROCEDURES}?page=${currentPage}&sku=${sku}`;
    getElements('procedures', url, this.setProcedures);

    this.clearInputs();
    this.buildAlert('success', 'Filtros aplicados.');
  };

  clearInputs = () => {
    return this.setState({
      sku: '',
    });
  }

  componentWillUnmount() {
    clearTimeout(this.state.timeout);
  }

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
      'procedures',
      `${LIST_PROCEDURES}?page=${selectedPage}`,
      this.setProcedures,
      selectedPage
    );
  };

  changePage = () => {
    const { selectedPage } = this.state;
    this.setState({ currentPage: selectedPage, isLoading: true });
    getElements('procedures', `${LIST_PROCEDURES}?page=${selectedPage}`, this.setProcedures, selectedPage);
  };

  // Functions related to requests
  responseHandler = (response, body) => {
    if (response === 'success') {
      getElements('procedures', LIST_PROCEDURES, this.setProcedures);
      return this.buildAlert(
        'success',
        'La solicitud ha sido procesada exitosamente.'
      );
    }
    return this.buildAlert('error', ERROR_MESSAGE);
  }

  setProcedures = async (response, body) => {
    this.setState({ isLoading: false });
    if (response === 'success') {
      // Agregar la propiedad "selected" a cada objeto y establecerla según el valor del campo "status"
      let procedures = body.procedures.map((procedure) => ({
        ...procedure,
      }));

      this.setState({
        procedures,
        totalPages: body.totalPages,
      });

    } else if (body === NO_ITEMS_ERROR) {
      this.buildAlert('attention', NO_ITEM_MESSAGE);
    } else {
      this.buildAlert('error', ERROR_MESSAGE);
    }
  };

  setDateProcedures = async (response, body) => {
    if (response === 'success') {
      const responseData = body.lastProcedureDate;
      this.setState({
        date_rabbit: responseData.date_rabbit,
        responsible: responseData.responsible
      });
      //console.log('DATERABBIT', responseData.date_rabbit);
    } else if (body === NO_ITEMS_ERROR) {
      this.buildAlert('attention', NO_ITEMS_ERROR);
    } else {
      this.buildAlert('error', ERROR_MESSAGE);
    }
  }


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
  };

  exportToExcel = () => {
    const { procedures, date_rabbit, responsible, filteredProcedures } = this.state;

    let proceduresToExport = [];

    if (filteredProcedures.length > 0) {
      // Si hay filtros aplicados, exporta solo los procedimientos filtrados.
      proceduresToExport = filteredProcedures;
    } else {
      // Si no hay filtros aplicados, exporta todos los procedimientos.
      proceduresToExport = procedures;
    }

    if (proceduresToExport.length === 0) {
      // Agregar un manejo de error o mensaje aquí si es necesario
      return;
    }

    // Crear un nuevo libro de trabajo de Excel.
    const wb = XLSX.utils.book_new();

    // Crear una hoja de trabajo de Excel.
    const ws = XLSX.utils.json_to_sheet(
      proceduresToExport.map(procedure => ({
        'Ref Shopify': `'${procedure.id}`, // Agregamos una comilla simple al inicio para forzar el formato de texto
        'SKU': procedure.variants[0].sku,
        'Nombre': procedure.title,
        'Precio': procedure.variants[0].price,
        'Precio de comparación': procedure.variants[0].compare_at_price,
        'Vendedor': procedure.vendor,
        'Etiquetas': procedure.tags,
        'Activo': procedure.status === 'active' ? 'SI' : 'NO',
        'Última sincronización': date_rabbit,
        'Responsable': responsible
      }))
    );

    // Agregar la hoja de trabajo al libro de trabajo.
    XLSX.utils.book_append_sheet(wb, ws, 'Procedimientos');

    // Ajustar el ancho de las columnas manualmente
    ws['!cols'] = [
      { wch: 15 }, // Ancho de la columna "Ref Shopify"
      { wch: 10 }, // Ancho de la columna "SKU"
      { wch: 40 }, // Ancho de la columna "Nombre"
      { wch: 10 }, //precio
      { wch: 10 }, //precio comparación
      { wch: 10 }, //vendedor
      { wch: 40 }, // Ancho de la columna "Etiquetas"
      { wch: 10 }, // Ancho de la columna "Activo"
      { wch: 20 }, // Ancho de la columna "Activo"
      { wch: 15 }, // Ancho de la columna "Activo"
    ];

    // Generar un archivo Excel y descargarlo.
    XLSX.writeFile(wb, 'procedimientos.xlsx');
  };

  setTable() {
    let rows = this.state.procedures

    if (rows.length < 1) {
      return (
        <span className='global-body-text' style={{ marginBottom: '0px' }}>
          Actualmente no hay procedimientos con los filtros seleccionados.
        </span>
      );
    }

    let table_rows = rows.map((obj, index) => (
      <tr key={'tr' + obj.id + index}>
        <td>{obj.id}</td>
        <td>{obj.variants[0].sku}</td>
        <td>{obj.title}</td>
        <td>{obj.tags}</td>
        <td>
          <input type='checkbox' checked={obj.status === 'active'} disabled />
        </td>
      </tr>
    ));

    let table = (
      <table>
        <tbody>
          <tr>
            <th>ID</th>
            <th>SKU</th>
            <th>Nombre</th>
            <th>Etiquetas</th>
            <th>Activo</th>
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
        <span className='global-comp-title'>Procedimientos</span>
        <span className='global-comp-description'>
          Aquí podrá visualizar todos los procedimientos.
        </span>
        <div className='global-comp-form-container'>
          <div className='actions-container'>

            <div className="filter-container">
              <label className='global-comp-description searchQ'>Buscar:</label>
              <input
                type='text'
                id='sku'
                className='global-form-input'
                style={{ maxWidth: '250px' }}
                placeholder='SKU'
                value={this.state.sku} // Cambiar de 'searchQuery' a 'sku'
                onChange={this.handleChange}
              />
            </div>

            <button
              className='global-form-solid-button sync-button'
              onClick={this.search}
            >
              Buscar
            </button>

            <button
              onClick={this.exportToExcel}
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
          <div className='table-container'>
            {table}
          </div>
        </div>
      </div>
    );
  }
}

export default ListProcedures;