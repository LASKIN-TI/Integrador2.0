import React, { Component } from 'react';
import './Styles.css';
import Alert from '../Alerts/Alert';
import { getElements } from '../../Functions/Get';
import Modal from './Modal'
import {
  ERROR_MESSAGE,
  ALERT_TIMEOUT,
  NO_ITEMS_ERROR,
  ORDERS_RECORDS,
} from '../../Functions/Constants';
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import { format } from 'date-fns';
import ModalRecords from './ModalRecords';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
registerLocale('es', es);
class RecordsOrders extends Component {
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
      startDate: new Date(),
      endDate: new Date(),

      totalOrders: 0,
    };
    this.refreshView = this.refreshView.bind(this);
  }


  componentDidMount() {
    let session_id = sessionStorage.getItem('user_id');
    this.setState({ isLoading: true });

    // Obtener la fecha actual
    const currentDate = new Date();
    const formattedDateStart = format(currentDate, "yyyy.MM.dd 00:00:00");
    const formattedDateEnd = format(currentDate, "yyyy.MM.dd 23:59:59");

    // Establecer la fecha actual como startDate por defecto
    this.setState({ startDate: currentDate });

    // Obtener los registros con la fecha actual por defecto
    getElements('orders', `${ORDERS_RECORDS}?page=${1}&dateFrom=${formattedDateStart}&dateTo=${formattedDateEnd}`, this.setorders);
  }




  search = () => {
    const { startDate } = this.state;

    // Establecer la fecha de inicio para el día seleccionado a las 00:00:00
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);

    // Establecer la fecha de fin para el día seleccionado a las 23:59:59
    const endOfDay = new Date(startDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Formatear las fechas para enviarlas al backend en el formato deseado
    const formattedStartDate = format(startOfDay, "yyyy.MM.dd HH:mm:ss");
    const formattedEndDate = format(endOfDay, "yyyy.MM.dd HH:mm:ss");

    const url = `${ORDERS_RECORDS}?page=${1}&dateFrom=${formattedStartDate}&dateTo=${formattedEndDate}`;
    getElements('orders', url, this.setorders);

    //this.clearInputs();
    this.buildAlert('success', 'Se han aplicado los filtros.');
  };

  handleStartDateChange = (date) => {
    // No es necesario ajustar la fecha, React-DatePicker ya devuelve la fecha en el formato correcto
    this.setState({ startDate: date });
  };



  refreshView = () => {
    getElements('orders', ORDERS_RECORDS, this.setorders);
    this.clearInputs();
    this.buildAlert('success', 'La vista se ha refrescado.');
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
    // No es necesario ajustar la fecha, React-DatePicker ya devuelve la fecha en el formato correcto
    this.setState({ startDate: date });
  };


  handleSelectChange = (event) => {
    this.setState({ selectedOption: event.target.value });
  };

  handlePageChange = (event) => {
    const selectedPage = parseInt(event.target.value, 10);
    this.setState({ selectedPage, isLoading: true });
    getElements(
      'orders',
      `${ORDERS_RECORDS}?page=${selectedPage}`,
      this.setorders,
      selectedPage
    );
  };


  responseHandler = (response, body) => {
    if (response === 'success') {
      getElements('orders', ORDERS_RECORDS, this.setorders);
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
      this.setState({
        orders,
        totalOrders: body.totalOrders,
        incorrectOrders: body.incorrectOrders,
      });
      console.log(orders);
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

  showModal = () => {
    const { orders } = this.state; // Obtén las órdenes del estado
    const { order_ref, id_shopify, message } = this.state; // Asegúrate de tener estas propiedades definidas o ajusta según corresponda
    this.props.showModal(
      <ModalRecords
        order_ref={order_ref}
        id_shopify={id_shopify}
        message={message}
        orders={orders} // Pasa las órdenes al modal
        closeModal={this.closeModal}
      />
    );
  }




  closeModal = () => {
    return this.props.closeModal()
  }


  // Dentro de la función setTable()
  setTable() {
    const { totalOrders, incorrectOrders } = this.state;
    let percentage = 0;

    if (totalOrders !== 0) {
      percentage = (totalOrders - incorrectOrders) / totalOrders * 100;
    }

    return (
      <table>
        <tbody>
          <tr>
            <th>Día</th>
            <th>Cantidad de órdenes</th>
            <th>Cantidad de errores en las órdenes</th>
            <th>Progreso</th>
            <th>Acciones</th>
          </tr>
          <tr>
            <td>{format(this.state.startDate, "dd/MM/yyyy")}</td>
            <td>{totalOrders}</td>
            <td>{incorrectOrders}</td>
            <td>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${percentage}%` }}>
                  <div className="progress">{percentage.toFixed(2)}%</div>
                </div>
              </div>
            </td>
            <td>
              <span
                className='global-table-link'
                onClick={() => this.showModal()}
                style={{ marginRight: '10px' }}
              >
                Revisión
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    );
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
          Aquí podrá visualizar los días y la cantidad de órdenes procesadas por día.
        </span>
        <div className='global-comp-form-container'>
          <div className='global-special-form-group'>

            <div className="actions-container">

              <div className="filter-container">
                <label className='global-comp-description'>Fecha:</label>

                <DatePicker
                  selected={this.state.startDate}
                  onChange={this.handleStartDateChange}
                  placeholderText="Fecha"
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
          </div>
          <div className='table-container'>
            {table}
          </div>
        </div>
      </div>
    );
  }

}

export default RecordsOrders;
