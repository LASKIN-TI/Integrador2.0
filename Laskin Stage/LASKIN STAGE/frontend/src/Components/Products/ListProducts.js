import React, { Component } from 'react';
import './Styles.css';
import Alert from '../Alerts/Alert';
import { getElements } from '../../Functions/Get';
import {
  PRODUCTS_SHOPIFY,
  UPDATE_POLICY,
  ERROR_MESSAGE,
  ALERT_TIMEOUT,
  NO_ITEMS_ERROR,
  STATES,
  UPDATE_STATE,
  CONFIRM_ACTIVATE_INVENTORY,
  CONFIRM_DESACTIVATE_INVENTORY,
  DATE_STOCK,
  DATE_ACTIVATION,
  DATE_DESACTIVATION,
  DATE_PRODUCTS
} from '../../Functions/Constants';
import * as XLSX from 'xlsx';
import { simpleRequest } from '../../Functions/Post';
import { simpleAlert, simpleAlert2 } from '../../Functions/SwalAlert'
import { recursiveEnqueue, recursiveEnqueueUpdate } from '../../Functions/HelpersAWS';


class ListProducts extends Component {
  constructor() {
    super();
    this.state = {
      productsShopify: [],
      states: [],
      alert: null,
      timeout: null,
      currentPage: 1,
      productsPerPage: 100,
      switchValue: false,
      filteredProducts: [],
      searchQuery: '',
      activationDate: '',
      activationResponsible: '',
      desactivationDate: '',
      desactivationResponsible: '',
      date_rabbit: '',
      responsible: '',
    };
    this.refreshView = this.refreshView.bind(this);

  }

  componentDidMount() {
    let session_id = sessionStorage.getItem('user_id');
    getElements('productsShopify', PRODUCTS_SHOPIFY, this.setProductsShopify);
    getElements('states', STATES, this.setStates)
    getElements('activation', DATE_ACTIVATION, this.setActivation);
    getElements('desactivation', DATE_DESACTIVATION, this.setDesactivation);
    getElements('dateProducts', DATE_PRODUCTS, this.setDateProducts);

    const storedSwitchValue = localStorage.getItem('switchValue');
    if (storedSwitchValue !== null) {
      this.setState({ switchValue: JSON.parse(storedSwitchValue) });
    }
  }


  componentWillUnmount() {
    clearTimeout(this.state.timeout);
  }

  handleChange = (event) => {
    let attribute = event.target.id;
    let value = event.target.value;

    if (attribute === 'searchQuery') {
      this.setState({ [attribute]: value }, () => {
        this.filterProducts();
      });
    } else {
      this.setState({ [attribute]: value });
    }
  };

  refreshView = () => {
    getElements('productsShopify', PRODUCTS_SHOPIFY, this.setProductsShopify);
    getElements('states', STATES, this.setStates);
    getElements('activation', DATE_ACTIVATION, this.setActivation);
    getElements('desactivation', DATE_DESACTIVATION, this.setDesactivation);
    this.buildAlert('success', 'La vista se ha refrescado.');

  };

  formatDate(dateString) {
    const date = new Date(dateString);
  
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
  }

  
  filterProducts = () => {
    const { productsShopify } = this.state;
    let filteredProducts = productsShopify || [];

    // Filtrar por SKU o nombre
    if (typeof this.state.searchQuery === 'string' && this.state.searchQuery.trim() !== '') {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.variants[0].sku.includes(this.state.searchQuery) ||
          product.title.toLowerCase().includes(this.state.searchQuery.toLowerCase())
      );
    }

    this.setState({ filteredProducts });
  };

  toggleSwitch = () => {
    this.setState(
      (prevState) => ({
        switchValue: !prevState.switchValue,
      }),
      () => {

        const currentDate = new Date();

        // Obtener los componentes de la fecha actual
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Sumar 1 al mes ya que los meses comienzan en 0
        const day = String(currentDate.getDate()).padStart(2, '0');
        const hours = String(currentDate.getHours()).padStart(2, '0');
        const minutes = String(currentDate.getMinutes()).padStart(2, '0');
        const seconds = String(currentDate.getSeconds()).padStart(2, '0');

        // Formatear la fecha en el formato deseado
        const formattedDate = `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;

        const { switchValue } = this.state;
        if (switchValue) {
          const data = {
            value: 1,
          };

          const body = {
            responsible: sessionStorage.getItem('user_name'),
            action: 'ACTIVATION',
            date: formattedDate
          }

          return simpleAlert(
            CONFIRM_ACTIVATE_INVENTORY, () =>
            simpleRequest(UPDATE_STATE, 'PUT', data, this.responseHandler),
            simpleRequest(DATE_STOCK, 'POST', body, this.responseHandler),
            this.updateInventoryPolicyToContinue(),
          );
        } else {
          const data = {
            value: 0,
          };

          const body = {
            responsible: sessionStorage.getItem('user_name'),
            action: 'DESACTIVATION',
            date: formattedDate
          }


          return simpleAlert2(
            CONFIRM_DESACTIVATE_INVENTORY, () =>
            simpleRequest(UPDATE_STATE, 'PUT', data, this.responseHandler),
            simpleRequest(DATE_STOCK, 'POST', body, this.responseHandler),
            this.updateInventoryPolicyToDeny()
          );
        }
      }
    );
  };


  updateInventoryPolicyToContinue = async () => {
    const { productsShopify } = this.state;

    // 1. Filtra los productos con estado "active" y copia los productos en una nueva variable
    const updatedProductsShopify = productsShopify
      .filter(product => product.status === 'active')
      .map(product => ({
        ...product,
        variants: product.variants && product.variants.length > 0
          ? [{ ...product.variants[0], inventory_policy: "continue" }]
          : product.variants
      }));

    //console.log(updatedProductsShopify);
    await recursiveEnqueueUpdate(updatedProductsShopify, 0);
  };


  updateInventoryPolicyToDeny = async () => {
    const { productsShopify } = this.state;

    // 1. Filtra los productos con estado "active" y copia los productos en una nueva variable
    const updatedProductsShopify = productsShopify
      .filter(product => product.status === 'active')
      .map(product => ({
        ...product,
        variants: product.variants && product.variants.length > 0
          ? [{ ...product.variants[0], inventory_policy: "deny" }]
          : product.variants
      }));

    //console.log(updatedProductsShopify);
    await recursiveEnqueueUpdate(updatedProductsShopify, 0);
  };


  // Functions related to requests
  responseHandler = (response, body) => {
    if (response === 'success') {
      getElements('productsShopify', PRODUCTS_SHOPIFY, this.setProductsShopify);
      return this.buildAlert(
        'success',
        'La solicitud ha sido procesada exitosamente.'
      );
    }
    return this.buildAlert('error', ERROR_MESSAGE);
  }

  setProductsShopify = async (response, body) => {
    if (response === 'success') {
      let productsShopify = body.products.map((product) => ({
        ...product,
      }));
      this.setState({ productsShopify });

      //console.log(productsShopify);
    } else if (body === NO_ITEMS_ERROR) {
      this.buildAlert('attention', NO_ITEM_MESSAGE);
    } else {
      this.buildAlert('error', ERROR_MESSAGE);
    }
  };

  setStates = async (response, body) => {
    if (response === 'success') {
      let states = body.map((statesGroup) => ({
        ...statesGroup,
      }));

      this.setState({ states });

      // Verifica si el valor de 'stock' es 1 y actualiza el estado 'switchValue'
      const stockState = states.find(state => state.name === 'stock');
      if (stockState && stockState.value === 1) {
        this.setState({ switchValue: true });
      } else {
        this.setState({ switchValue: false });
      }

      //console.log('ESTADOS:', states);
    } else if (body === NO_ITEMS_ERROR) {
      this.buildAlert('attention', NO_ITEM_MESSAGE);
    } else {
      this.buildAlert('error', ERROR_MESSAGE);
    }
  }

  setActivation = async (response, body) => {
    if (response === 'success') {
      const responseData = body.lastActivationDate;
      this.setState({
        activationDate: responseData.date,
        activationResponsible: responseData.responsible,
      });
      //console.log('ACTIVATION', responseData.date);
    } else if (body === NO_ITEMS_ERROR) {
      this.buildAlert('attention', NO_ITEMS_ERROR);
    } else {
      this.buildAlert('error', ERROR_MESSAGE);
    }
  }
  

  setDesactivation = async (response, body) => {
    if (response === 'success') {
      const responseData = body.lastActivationDate;
      this.setState({
        desactivationResponsible: responseData.responsible,
        desactivationDate: responseData.date
      });
      //console.log('DESACTIVATION', responseData.date);
    } else if (body === NO_ITEMS_ERROR) {
      this.buildAlert('attention', NO_ITEMS_ERROR);
    } else {
      this.buildAlert('error', ERROR_MESSAGE);
    }
  }

  setDateProducts = async (response, body) => {
    if (response === 'success') {
      const responseData = body.lastProductDate;
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
    const { filteredProducts, productsShopify, date_rabbit, responsible, activationDate, activationResponsible, desactivationDate, desactivationResponsible } = this.state;
  
    let productsToExport = [];
  
    if (filteredProducts.length > 0) {
      // Si hay filtros aplicados, exporta solo los productos filtrados.
      productsToExport = filteredProducts;
    } else {
      // Si no hay filtros aplicados, exporta todos los productos.
      productsToExport = productsShopify;
    }
  
    if (productsToExport.length === 0) {
      // Agregar un manejo de error o mensaje aquí si es necesario
      return;
    }
  
    // Crear un nuevo libro de trabajo de Excel.
    const wb = XLSX.utils.book_new();
  
    // Crear una hoja de trabajo de Excel.
    const ws = XLSX.utils.json_to_sheet(
      productsToExport.map(product => ({
        'Ref Shopify': `'${product.id}`, // Agregamos una comilla simple al inicio para forzar el formato de texto
        'SKU': product.variants[0].sku,
        'Nombre': product.title,
        'Precio': product.variants[0].price,
        'Precio de comparación': product.variants[0].compare_at_price,
        'Inventario': product.variants[0].inventory_quantity,
        'Vendedor': product.vendor,
        'Etiquetas': product.tags,
        'Activo': product.status === 'active' ? 'SI' : 'NO',
        'Permitir vender sin stock': product.variants[0].inventory_policy === 'deny' ? 'NO' : 'SI',
        'Última sincronización': date_rabbit,
        'Responsable': responsible,
        'Activación venta sin stock': activationDate,
        'Responsable Activación': activationResponsible,
        'Desactivación venta sin stock': desactivationDate,
        'Responsable Desactivación': desactivationResponsible
      }))
    );
  
    // Agregar la hoja de trabajo al libro de trabajo.
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');
  
    // Ajustar el ancho de las columnas manualmente
    ws['!cols'] = [
      { wch: 15 }, // Ancho de la columna "Ref Shopify"
      { wch: 10 }, // Ancho de la columna "SKU"
      { wch: 40 }, // Ancho de la columna "Nombre"
      { wch: 10 }, //precio
      { wch: 10 }, //precio comparación
      { wch: 10 }, // inventario
      { wch: 10 }, //vendedor
      { wch: 40 }, // Ancho de la columna "Etiquetas"
      { wch: 10 }, // Ancho de la columna "Activo"
      { wch: 10 }  // Ancho de la columna "Permitir vender sin stock"
    ];
  
    // Generar un archivo Excel y descargarlo.
    XLSX.writeFile(wb, 'productos.xlsx');
  };


  setTable() {
    const { filteredProducts, currentPage, productsPerPage, productsShopify } = this.state;

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    let currentProductsShopify = [];
    if (filteredProducts.length < 1) {
      currentProductsShopify = productsShopify.slice(indexOfFirstProduct, indexOfLastProduct);
    } else {
      currentProductsShopify = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    }

    if (currentProductsShopify.length < 1) {
      return (
        <span className='global-body-text' style={{ marginBottom: '0px' }}>
          Actualmente no hay productos con los filtros seleccionados.
        </span>
      );
    }

    currentProductsShopify.sort((a, b) => {
      const skuA = parseInt(a.variants[0].sku.match(/\d+/)[0], 10);
      const skuB = parseInt(b.variants[0].sku.match(/\d+/)[0], 10);
      return skuA - skuB;
    });

    let table_rows = currentProductsShopify.map((obj) => (
      <tr key={'tr' + obj.id}>
        <td>{obj.id}</td>
        <td>{obj.variants[0].sku}</td>
        <td>{obj.title}</td>
        <td>{obj.tags}</td>
        <td>
          <input type='checkbox' checked={obj.status === 'active'} disabled />
        </td>
        <td>
          {obj.variants[0].inventory_policy === 'deny' ? 'NO' : 'SI'}
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
            <th>Permitir vender sin stock</th>
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
    const { productsShopify, productsPerPage, currentPage } = this.state;
    const pageNumbers = Math.ceil(productsShopify.length / productsPerPage);

    const paginationOptions = [];
    for (let i = 1; i <= pageNumbers; i++) {
      paginationOptions.push(
        <option key={i} value={i}>
          {i}
        </option>
      );
    }

    return (
      <div className='pagination-container'>
        <label htmlFor="pageDropdown">Página:</label>
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
        <span className='global-comp-title'>Productos</span>
        <span className='global-comp-description'>
          Aquí podrá visualizar todos los productos.
        </span>
        <div className='global-comp-form-container'>
          <div className='switch-container'>
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


            <label className='switch-label'>Vender sin stock:</label>
            <label className='switch'>
              <input
                type='checkbox'
                checked={this.state.switchValue}
                onChange={this.toggleSwitch}
              />
              <span className='slider round'></span>
            </label>
            <button
              onClick={this.exportToExcel}
              className={`global-form-solid-button green-button`}
              style={{ marginLeft: 'auto' }}
            >
              Exportar a Excel
            </button>

            <button
              className='global-form-solid-button sync-button'
              onClick={this.refreshView}
            >
              Refrescar
            </button>
          </div>
          
          <div className='global-comp-description-container'>
          <div className="updated-on-container">
          Fecha de activación: {this.formatDate(this.state.activationDate)} // {this.state.activationResponsible}
          </div>
          </div>

          <div className="updated-on-container">
          Fecha de inactivación: {this.formatDate(this.state.desactivationDate)} // {this.state.desactivationResponsible}
          </div>
          <div className='pagination-container'>{pagination}</div>
          <div className='table-container'>{table}</div>
        </div>
      </div>
    );
  }
}

export default ListProducts;
