import React, { Component } from 'react';
import './Styles.css';
import Alert from '../Alerts/Alert';
import { getElements } from '../../Functions/Get';
import * as XLSX from 'xlsx';
import {
  PROCEDURES_SHOPIFY,
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
      productsPerPage: 100,
      filteredProcedures: [],
      date_rabbit: '',
      responsible: '',
      searchQuery: '',
    };
  }

  componentDidMount() {
    let session_id = sessionStorage.getItem('user_id');
    getElements('procedure', PROCEDURES_SHOPIFY, this.setProcedures);
    getElements('dateProcedures', DATE_PROCEDURES, this.setDateProcedures);
  }

  componentWillUnmount() {
    clearTimeout(this.state.timeout);
  }

  handleChange = (event) => {
    let attribute = event.target.id;
    let value = event.target.value;

    if (attribute === 'searchQuery') {
      this.setState({ [attribute]: value }, () => {
        this.filterProcedures();
      });
    } else {
      this.setState({ [attribute]: value });
    }
  };

  // Functions related to requests
  responseHandler = (response, body) => {
    if (response === 'success') {
      getElements('procedure', PROCEDURES_SHOPIFY, this.setProcedures);
      return this.buildAlert(
        'success',
        'La solicitud ha sido procesada exitosamente.'
      );
    }
    return this.buildAlert('error', ERROR_MESSAGE);
  }

  setProcedures = async (response, body) => {
    if (response === 'success') {
      // Agregar la propiedad "selected" a cada objeto y establecerla según el valor del campo "status"
      let procedures = body.procedures.map((procedure) => ({
        ...procedure,
      }));
      this.setState({ procedures });
      //console.log(procedures);
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

  filterProcedures = () => {
    const { procedures } = this.state;
    let filteredProcedures = procedures;

    // Filtrar por SKU o nombre
    if (typeof this.state.searchQuery === 'string' && this.state.searchQuery.trim() !== '') {
      filteredProcedures = filteredProcedures.filter(
        (product) =>
          product.variants[0].sku.includes(this.state.searchQuery) ||
          product.title.toLowerCase().includes(this.state.searchQuery.toLowerCase())
      );
    }

    this.setState({ filteredProcedures });
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
    const { procedures, currentPage, productsPerPage, filteredProcedures } = this.state;

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    let currentProducts = [];
    if (filteredProcedures.length < 1) {
      currentProducts = procedures.slice(indexOfFirstProduct, indexOfLastProduct);
    } else {
      currentProducts = filteredProcedures.slice(indexOfFirstProduct, indexOfLastProduct);
    }

    if (currentProducts.length < 1) {
      return (
        <span className='global-body-text' style={{ marginBottom: '0px' }}>
          Actualmente no hay procedimientos con los filtros seleccionados.
        </span>
      );
    }

    let table_rows = currentProducts.map((obj) => (
      <tr key={'tr' + obj.id}>
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

  handlePageChange = (pageNumber) => {
    this.setState({ currentPage: pageNumber });
  };

  renderPagination = () => {
    const { procedures, productsPerPage, currentPage } = this.state;
    const pageNumbers = Math.ceil(procedures.length / productsPerPage);

    const paginationOptions = [];
    for (let i = 1; i <= pageNumbers; i++) {
      paginationOptions.push(
        <option key={i} value={i}>Página 
          {i}
        </option>
      );
    }

    return (
      <div className='pagination-container'>
        <select
          id="pageDropdown"
          className="pagination-dropdown"
          value={currentPage}
          onChange={(e) => this.handlePageChange(parseInt(e.target.value))}
        >
          {paginationOptions}
        </select>
      </div>
    );
  };

  render() {
    let table = this.setTable();
    let pagination = this.renderPagination();

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
                id='searchQuery'
                className='global-form-input'
                style={{ maxWidth: '250px' }}
                placeholder='Buscar por SKU o nombre ...'
                value={this.state.searchQuery}
                onChange={this.handleChange}
              />
            </div>
            <button
              onClick={this.exportToExcel}
              className={`global-form-solid-button green-button`}
              style={{ marginLeft: 'auto' }}
            >
              Exportar a Excel
            </button>
          </div>
          <div className='pagination-container'>
            {pagination}
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