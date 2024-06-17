import React, { Component } from 'react';
import './Styles.css';
import Alert from '../Alerts/Alert';
import { getElements, downloadExcel } from '../../Functions/Get';
import { simpleRequest } from '../../Functions/Post';
import Modal from './Modal';
import {
  SEND_HOOK,
  ERROR_MESSAGE,
  ALERT_TIMEOUT,
  NO_ITEMS_ERROR,
  LIST_ORDERS_PAGE,
  SEND_ORDER,
  ORDERS_EXCEL
} from '../../Functions/Constants';
import { sendOrders } from '../../Functions/Post';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import { format } from 'date-fns';
registerLocale('es', es);

class ListOrders extends Component {
  constructor() {
    super();
    this.state = {
      orders: [],

      alert: null,
      timeout: null,

      currentPage: 1,
      totalPages: 1,
      selectedPage: 1,
      isLoading: false,
      idShopify: '',
      order_id: '',

      startDate: null,
      endDate: null,
    };
    this.refreshView = this.refreshView.bind(this);
  }

  componentDidMount() {
    let session_id = sessionStorage.getItem('user_id');
    this.setState({ isLoading: true });
    getElements('orders', `${LIST_ORDERS_PAGE}?page=${this.state.currentPage}`, this.setorders, this.state.currentPage);
  }


  search = () => {
    const { currentPage, startDate, endDate, idShopify, selectedOption, order_id } = this.state;

    // Formatear las fechas a 'yyyy.MM.dd HH:mm:ss'
    const formattedStartDate = startDate ? format(startDate, "yyyy.MM.dd 00:00:00") : '';
    const formattedEndDate = endDate ? format(endDate, "yyyy.MM.dd 23:59:59") : '';

    // Determinar el valor del nuevo parámetro "status" según la opción seleccionada
    let status;
    if (selectedOption === 'correctas') {
      status = 'correct';
    } else if (selectedOption === 'error') {
      status = 'incorrect';
    } else {
      status = null; // Si no se selecciona ninguna opción, pasa null
    }

    // Construir la URL con los parámetros de filtro
    const url = `${LIST_ORDERS_PAGE}?page=${currentPage}&dateFrom=${formattedStartDate}&dateTo=${formattedEndDate}&status=${status}&id_shopify=${idShopify}&order_id=${order_id}`;

    // Realizar la solicitud con la URL construida
    getElements('orders', url, this.setorders);

    // Limpiar los inputs y mostrar la alerta
    this.buildAlert('success', 'Se han aplicado los filtros.');
  };

  refreshView = () => {
    getElements('orders', `${LIST_ORDERS_PAGE}?page=${this.state.currentPage}`, this.setorders);
    this.clearInputs();
    this.buildAlert('success', 'La vista se ha refrescado.');
  };

  exportExcel = () => {
    const { currentPage, startDate, endDate, idShopify, selectedOption, order_id } = this.state;

    // Formatear las fechas a 'yyyy.MM.dd HH:mm:ss'
    const formattedStartDate = startDate ? format(startDate, "yyyy.MM.dd 00:00:00") : '';
    const formattedEndDate = endDate ? format(endDate, "yyyy.MM.dd 23:59:59") : '';

    // Determinar el valor del nuevo parámetro "status" según la opción seleccionada
    let status;
    if (selectedOption === 'correctas') {
      status = 'correct';
    } else if (selectedOption === 'error') {
      status = 'incorrect';
    } else {
      status = null; // Si no se selecciona ninguna opción, pasa null
    }

    // Construir la URL con los parámetros de filtro
    const url = `${ORDERS_EXCEL}?page=${currentPage}&dateFrom=${formattedStartDate}&dateTo=${formattedEndDate}&status=${status}&id_shopify=${idShopify}&order_id=${order_id}`;

    // Llamar a la función downloadExcel con la URL construida
    downloadExcel(url, (status, message) => {
      if (status === 'success') {
        this.buildAlert('success', message);
      } else {
        this.buildAlert('error', message);
      }
    });
  };

  componentWillUnmount() {
    clearTimeout(this.state.timeout);
  }

  handleChange = (event) => {
    let attribute = event.target.id;
    let value = event.target.value;

    this.setState({ [attribute]: value });
  };

  handleStartDateChange = (date) => {
    this.setState({ startDate: date });
  };

  handleEndDateChange = (date) => {
    this.setState({ endDate: date });
  };

  handleSelectChange = (event) => {
    this.setState({ selectedOption: event.target.value });
  };

  handleIdShopifyChange = (event) => {
    this.setState({ selectedOption: event.target.value });
  };

  handleOrderIdChange = (event) => {
    this.setState({ selectedOption: event.target.value });
  };

  handlePageChange = (event) => {
    const selectedPage = parseInt(event.target.value, 10);
    this.setState({ selectedPage, isLoading: true });
    getElements(
      'orders',
      `${LIST_ORDERS_PAGE}?page=${selectedPage}`,
      this.setorders,
      selectedPage
    );
  };

  changePage = () => {
    const { selectedPage } = this.state;
    this.setState({ currentPage: selectedPage, isLoading: true });
    getElements('orders', `${LIST_ORDERS_PAGE}?page=${selectedPage}`, this.setorders, selectedPage);
  };

  responseHandler = (response, body) => {
    if (response === 'success') {
      getElements('orders', `${LIST_ORDERS_PAGE}?page=${this.state.currentPage}`, this.setorders);
      return this.buildAlert(
        'success',
        'La solicitud ha sido procesada exitosamente.'
      );
    } else if (body === 'No se puede enviar en este momento') { // Verifica si el mensaje es específico
      return this.buildAlert(
        'attention',
        'No se puede enviar la solicitud en este momento.'
      );
    } else {
      return this.buildAlert('error', ERROR_MESSAGE);
    }
  };

  responseHandler2 = (response, body) => {
    if (response === 'success') {
      this.buildAlert('success', 'Órden enviada correctamente')
    }

    return this.buildAlert('error', ERROR_MESSAGE);
  };

  responseHandler3 = (response, body) => {
    if (response === 200) {
      getElements('orders', `${LIST_ORDERS_PAGE}?page=${this.state.currentPage}`, this.setorders);
      return this.buildAlert(
        'success',
        'La solicitud ha sido procesada exitosamente.'
      );
    }

    return this.buildAlert('error', ERROR_MESSAGE);
  };

  setorders = async (response, body) => {
    this.setState({ isLoading: false });
    if (response === 'success') {
      let orders = body.orders.map((order) => ({
        ...order,
      }));

      // Ordena las órdenes por order_date de manera descendente
      orders.sort((a, b) => {
        const dateA = new Date(a.order_date);
        const dateB = new Date(b.order_date);
        return dateB - dateA;
      });

      this.setState({
        orders,
        totalPages: body.totalPages,
      });
    } else if (body === NO_ITEMS_ERROR) {
      this.buildAlert('attention', NO_ITEM_MESSAGE);
    } else {
      this.buildAlert('error', ERROR_MESSAGE);
    }
  }

  close = () => {
    this.setState({ alert: null });
  };


  clearInputs = () => {
    return this.setState({
      startDate: '',
      endDate: '',
    });
  }

  buildAlert = (type, text) => {
    clearTimeout(this.state.timeout);

    this.setState({
      timeout: setTimeout(() => this.setState({ alert: null }), ALERT_TIMEOUT),
    });

    this.setState({
      alert: <Alert type={type} text={text} close={this.close} />,
    });
  };


  sendOne = (order) => {
    this.close();
    //console.log(order);
    return sendOrders(SEND_ORDER, 'POST', order, this.responseHandler)
  }

  sendHook = () => {
    this.close();
    // Devolver un estado 200 inmediatamente
    this.responseHandler('success', { message: 'La solicitud se está procesando.' });
    // Realizar la solicitud al servidor en segundo plano
    simpleRequest(SEND_HOOK, 'POST', {}, this.responseHandler);
  }


  routeEdit = (event) => {
    let id = event.target.id.split('-')
    sessionStorage.setItem('edit_order_id', id[1])

    return this.props.changeSelected(15)
  }

  showModal(order_ref, id_shopify, json) {
    return this.props.showModal(
      <Modal order_ref={order_ref} id_shopify={id_shopify} json={json} closeModal={this.closeModal} />
    )
  }

  closeModal = () => {
    return this.props.closeModal()
  }

  setTable() {
    let rows = this.state.orders


    if (rows.length < 1) {
      return (
        <span className="global-body-text" style={{ marginBottom: "0px" }}>
          Actualmente no hay órdenes con los filtros seleccionados.
        </span>
      );
    }

    let table_rows = rows.map((order, index) => (
      <tr key={order.order_ref ? "tr" + order.order_ref : "tr" + index}>
        <td>{order.order_date}</td>
        <th>{order.id_shopify}</th>
        <th>{order.order_id}</th>
        <td>{order.order_ref}</td>
        <td>{order.billing_first_name} {order.billing_last_name}</td>
        <td>{order.billing_state}</td>
        <td>{order.billing_city}</td>
        <td>{order.billing_typedcity}</td>
        <td>{order.shipping_state || order.billing_state}</td>
        <td>{order.shipping_city || order.billing_city}</td>
        <td>{order.shipping_typedcity || order.billing_typedcity}</td>
        <td>{order.location}</td>
        <td>{order.branch_id}</td>
        <td style={{
          color: (order.mensaje === 'Null - Sin parametrización - Asignación por default' ||
            order.mensaje === 'Null - Sin parametrización - Asignación sede de seguridad' ||
            order.mensaje === 'Null - Dirección no interpretada - Asignación por default' ||
            order.mensaje === 'Null - Dirección no interpretada - Asignación sede de seguridad' ||
            order.mensaje === 'Null - API de Google no disponible - Asignación sede de seguridad' ||
            order.mensaje === 'Null - API de Google no disponible - Asignación por default') ? 'red' : 'gray'
        }}>
          {order.mensaje}
        </td>
        <td>{order.order_total}</td>
        <td>
          <div>
            <span style={{ color: order.code === 0 || order.code === 368 || order.code === 175 ? 'green' : 'red' }}>
              Código: {order.code}
            </span>
          </div>

          <div>
            Mensaje: {order.message}
          </div>
        </td>
        <td>
          <span
            className='global-table-link'
            onClick={() => this.showModal(order.order_ref, order.id_shopify, order.json)}
            style={{ marginRight: '10px' }}
          >
            JSON
          </span>
        </td>
        <td>
          {order.state !== 1 && order.state !== 0 && order.code !== 368 && order.code !== 175 && (
            <span
              id={'e-' + order.order_ref}
              className='global-table-link'
              onClick={this.routeEdit}
              style={{ marginRight: '10px' }}
            >
              Editar
            </span>
          )}
        </td>
      </tr>
    ));


    let table = (
      <table>
        <tbody>
          <tr>
            <th>Fecha</th>
            <th>ID de órden</th>
            <th>ID HW</th>
            <th>Nombre órden</th>
            <th>Nombre del cliente</th>
            <th>Departamento de facturación</th>
            <th>Ciudad de facturación</th>
            <th>Ciudad original de facturación</th>
            <th>Departamento de envío</th>
            <th>Ciudad de envío</th>
            <th>Ciudad original de Envío</th>
            <th>Envío por</th>
            <th>ID Sucursal</th>
            <th>Mensaje Geo</th>
            <th>Total de la órden</th>
            <th>Estado</th>
            <th>Acciones</th>
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
        <span className='global-comp-title'>Órdenes</span>
        <span className='global-comp-description'>
          Aquí podrá visualizar todos las órdenes.
        </span>
        <div className='global-comp-form-container'>
          <div className='global-special-form-group'>

            <div className="actions-container">

              <div className="filter-container">
                <label className='global-comp-description'>Seleccione el estado:</label>
                <select
                  id=''
                  className='global-special-form-input-select'
                  onChange={this.handleSelectChange}
                  value={selectedOption}
                >
                  <option value=''>Todos</option>
                  <option value='correctas'>Correctas</option>
                  <option value='error'>Con error</option>
                </select>

              </div>

              <div className="filter-container">
                <label className='global-comp-description'>Buscar:</label>
                <input
                  type='text'
                  id='idShopify'
                  className='global-form-input'
                  style={{ maxWidth: '250px' }}
                  placeholder='Id de la órden'
                  value={this.state.idShopify}
                  onChange={this.handleChange}
                />
              </div>

              <div className="filter-container">
                <label className='global-comp-description'>Buscar:</label>
                <input
                  type='text'
                  id='order_id'
                  className='global-form-input'
                  style={{ maxWidth: '250px' }}
                  placeholder='Id HW'
                  value={this.state.order_id}
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

            <button
              onClick={this.sendHook}
              className={`global-form-solid-button orange-button`}
              style={{ marginLeft: 'auto' }}
            >
              Hook
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

export default ListOrders;
