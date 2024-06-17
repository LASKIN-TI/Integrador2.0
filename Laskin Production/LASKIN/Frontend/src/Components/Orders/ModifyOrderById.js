import React, { Component } from 'react'
import './Styles.css'
import Alert from '../Alerts/Alert'
import { getElementById, getElements } from '../../Functions/Get'
import { simpleRequest } from '../../Functions/Post'
import {
  NO_ITEMS_ERROR,
  ERROR_MESSAGE,
  ALERT_TIMEOUT,
  ORDER_DETAIL,
  CITIES,
  DEPARTMENTS,
  MODIFY_ORDER
} from '../../Functions/Constants'

class ModifyOrderById extends Component {
  constructor() {
    super()
    this.state = {
      id: 0,
      orders: [],
      cities: [],
      departments: [],
      skus: [],
      inventories: [],
      billing_city: '',
      shipping_city: '',
      billing_city_new: '',
      billing_state: '',
      shipping_state: '',
      billing_typedcity: '',
      shipping_typedcity: '',
      billing_state_new: '',
      shipping_state_new: '',
      shipping_city_new: '',
      selectedBillingCity: '',
      selectedShippingCity: '',
      selectedBillingState: '',
      selectedShippingState: '',
      billingCitySearch: '',
      shippingCitySearch: '',
      billingStateSearch: '',
      shippingStateSearch: '',
      billing_cedula: '',
      billing_cedula_new: '',
      selectedBillingCedula: '',
      billing_country: '',
      shipping_country: '',
      alert: '',
      timeout: '',
    }
  }

  componentDidMount() {
    getElements('cities', CITIES, this.setCities);
    getElements('departments', DEPARTMENTS, this.setDepartments);

    let session_id = sessionStorage.getItem('edit_order_id')
    if (session_id && session_id > 0) {
      this.setState({ id: parseInt(session_id) })
      return getElementById(
        ORDER_DETAIL + '?order_id=' + session_id,
        this.setOrderInfo
      )
    }
    return
  }

  componentWillUnmount() {
    clearTimeout(this.state.timeout)
  }

  // Functions to handle states
  handleChange = (event) => {
    let attribute = event.target.id;
    let value = event.target.value;

    switch (attribute) {
      case 'id':
        if (value.length >= 13) {
          getElementById(ORDER_DETAIL + '?order_id=' + value, this.setOrderInfo);
        }
        break;
      case 'billing_city_new':
        this.setState({ selectedBillingCity: value || this.state.billing_city });
        break;
      case 'shipping_city_new':
        this.setState({ selectedShippingCity: value || this.state.shipping_city });
        break;
      case 'billing_cedula_new':
        this.setState({ selectedBillingCedula: value || this.state.billing_cedula });
        break;
      case 'billing_state_new':
        this.setState({ selectedBillingState: value || this.state.billing_state });
        break;
      case 'shipping_state_new':
        this.setState({ selectedShippingState: value || this.state.shipping_state });
        break;
    }

    return this.setState({ [attribute]: value });
  };


  clearInputs = () => {
    const currentId = this.state.id;

    return this.setState({
      id: '',
      billing_cedula: '',
      billing_cedula_new: '',
      billing_city: '',
      shipping_city: '',
      billing_city_new: '',
      shipping_city_new: '',
      selectedBillingCity: '',
      selectedShippingCity: '',
      billing_state: '',
      selectedBillingState: '',
      billing_city: '',
      shipping_city: '',
      billing_city_new: '',
      billing_state: '',
      shipping_state: '',
      billing_typedcity: '',
      shipping_typedcity: '',
      billing_state_new: '',
      shipping_state_new: '',
      shipping_city_new: '',
      selectedBillingCity: '',
      selectedShippingCity: '',
      selectedBillingState: '',
      selectedShippingState: '',
      billingCitySearch: '',
      shippingCitySearch: '',
      billingStateSearch: '',
      shippingStateSearch: '',
      billing_cedula: '',
      billing_cedula_new: '',
      selectedBillingCedula: '',
    });
  };

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

  setOrderInfo = (response, body) => {
    const orders = body.rows;

    const filteredItems = orders.flatMap(order =>
      order.order_items.filter(item => item.sku.startsWith('U')).map(item => ({
        sku: item.sku,
        inventory: item.qty
      }))
    );
    //console.log(JSON.stringify(orders));
    // Extraer los SKUs e inventarios filtrados en arrays separados
    const skus = filteredItems.map(item => item.sku);
    const inventories = filteredItems.map(item => item.inventory);

    if (response === 'success') {
      this.setState({
        id: body.rows[0].order_ref,
        billing_cedula: body.rows[0].billing_cedula,
        shipping_cedula: body.rows[0].shipping_cedula,
        billing_city: body.rows[0].billing_city,
        shipping_city: body.rows[0].shipping_city,
        billing_state: body.rows[0].billing_state,
        shipping_state: body.rows[0].shipping_state,
        shipping_typedcity: body.rows[0].shipping_typedcity,
        billing_typedcity: body.rows[0].billing_typedcity,
        billing_country: body.rows[0].billing_country,
        shipping_country: body.rows[0].shipping_country,
        billing_address_1: body.rows[0].billing_address_1,
        shipping_address_1: body.rows[0].shipping_address_1,
        skus: skus,
        inventories: inventories
      });

      return this.buildAlert('success', 'Información de la órden recuperada.');
    }

    this.clearInputs();

    if (body === NO_ITEMS_ERROR) {
      return this.buildAlert(
        'attention',
        'No se ha encontrado una órden con ese ID. Por favor intente con otro.'
      );
    }

    return this.buildAlert('error', ERROR_MESSAGE);
  };

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

      // console.log(departments);
    } else if (body === NO_ITEMS_ERROR) {
      this.buildAlert('attention', NO_ITEM_MESSAGE);
    } else {
      this.buildAlert('error', ERROR_MESSAGE);
    }
  };


  responseHandler = (response, body) => {
    if (response === 'success') {
      this.clearInputs()
      this.buildAlert('success', 'Órden modificada con éxito.')
    } else {
      this.buildAlert('error', ERROR_MESSAGE)
    }
  }


  ModifyOrder = () => {
    const id = this.state.id;

    this.close();

    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}.${String(currentDate.getMonth() + 1).padStart(2, '0')}.${String(currentDate.getDate()).padStart(2, '0')} ${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}:${String(currentDate.getSeconds()).padStart(2, '0')}`;
    const skus = this.state.skus;
    const inventories = this.state.inventories;


    let body = {
      id: id,
      state: 0,
      order_modified: formattedDate,
      billing_cedula: this.state.billing_cedula_new || this.state.billing_cedula,
      billing_city: this.state.billing_city_new || this.state.billing_city,
      billing_state: this.state.billing_state_new || this.state.billing_state,
      billing_typedcity: this.state.billing_typedcity,
      billing_country: this.state.billing_country,
      billing_address_1: this.state.billing_address_1,
      shipping_city: this.state.shipping_city_new || this.state.shipping_city,
      shipping_state: this.state.shipping_state_new || this.state.shipping_state,
      shipping_typedcity: this.state.shipping_typedcity,
      shipping_country: this.state.shipping_country,
      shipping_address_1: this.state.shipping_address_1,
      skus: skus,
      inventories: inventories
    };

    if (this.state.billing_cedula_new) {
      body.billing_cedula = this.state.billing_cedula_new;
    }

    if (this.state.billing_city_new) {
      body.billing_city = this.state.billing_city_new;
    }

    if (this.state.shipping_city_new) {
      body.shipping_city = this.state.shipping_city_new;
    }

    if (this.state.billing_state_new) {
      body.billing_state = this.state.billing_state_new;
    }

    if (this.state.shipping_state_new) {
      body.shipping_state = this.state.shipping_state_new;
    }

    console.log(body);

    return simpleRequest(MODIFY_ORDER, 'PUT', body, this.responseHandler)
  }


  render() {
    return (
      <div className='cu-container'>
        {this.state.alert}
        <span className='global-comp-title'>Modificar Órden por ID (Order ref)</span>
        <span className='global-comp-description'>
          Diligencie el formulario para editar una órden. Puede especificar el
          ID o seleccionar la acción de editar en la opción de Listar órdenes
          del menú lateral.
        </span>
        <div className='global-comp-form-container'>
          <span className='global-comp-sub-title'>ESPECIFIQUE LA ÓRDEN</span>
          <span className='global-body-text'>
            Si fue redirigido a través de la opción Listar órdenes, el
            siguiente campo se diligencia de forma automática.
          </span>
          <div className='global-form-group'>
            <span className='global-form-label'>
              ID
              <strong className='global-form-mandatory'> *</strong>
            </span>
            <input
              id='id'
              type='number'
              className='global-form-input'
              value={this.state.id}
              onChange={this.handleChange}
            />
          </div>

          <div className='global-form-group'>
            <span className='global-form-label'>
              cédula (billing_cedula):
            </span>
            <input
              id='billing_cedula'
              type='text'
              className='global-form-input'
              value={this.state.billing_cedula}
              onChange={this.handleChange}
              readOnly
            />
          </div>

          <div className='global-form-group'>
            <span className='global-form-label'>
              Departamento de facturación (billing_state):
            </span>
            <input
              id='billing_state'
              type='text'
              className='global-form-input'
              value={this.state.billing_state}
              onChange={this.handleChange}
              readOnly
            />
          </div>

          <div className='global-form-group'>
            <span className='global-form-label'>
              Ciudad de ORIGINAL facturación (billing_typedcity):
            </span>
            <input
              id='billing_typedcity'
              type='text'
              className='global-form-input'
              value={this.state.billing_typedcity}
              onChange={this.handleChange}
              readOnly
            />
          </div>

          <div className='global-form-group'>
            <span className='global-form-label'>
              Ciudad de facturación (billing_city):
            </span>
            <input
              id='billing_city'
              type='text'
              className='global-form-input'
              value={this.state.billing_city}
              onChange={this.handleChange}
              readOnly
            />
          </div>

          <div className='global-form-group'>
            <span className='global-form-label'>
              Departamento de envío (shipping_state):
            </span>
            <input
              id='shipping_state'
              type='text'
              className='global-form-input'
              value={this.state.shipping_state === '' ? 'NO APLICA' : this.state.shipping_state}
              onChange={this.handleChange}
              readOnly
            />
          </div>


          <div className='global-form-group'>
            <span className='global-form-label'>
              Ciudad ORIGINAL de envío (shipping_typedcity):
            </span>
            <input
              id='shipping_typedcity'
              type='text'
              className='global-form-input'
              value={this.state.shipping_typedcity === '' ? 'NO APLICA' : this.state.shipping_typedcity}
              onChange={this.handleChange}
              readOnly
            />
          </div>


          <div className='global-form-group'>
            <span className='global-form-label'>
              Ciudad de envío (shipping_city):
            </span>
            <input
              id='shipping_city'
              type='text'
              className='global-form-input'
              value={this.state.shipping_city === '' ? 'NO APLICA' : this.state.shipping_city}
              onChange={this.handleChange}
              readOnly
            />
          </div>


          <span className='global-comp-sub-title'>EDITE LA ÓRDEN</span>


          <div className='global-form-group'>
            <span className='global-form-label'>
              Nueva cédula:
            </span>
            <input
              id='billing_cedula_new'
              type='text'
              className='global-form-input'
              value={this.state.selectedBillingCedula || this.state.billing_cedula}
              onChange={this.handleChange}
            />

          </div>

          <div className='global-form-group'>
            <span className='global-form-label'>
              Nuevo departamento de facturación (billing_state):
            </span>
            <select
              id='billing_state_new'
              className='global-form-input'
              value={this.state.selectedBillingState || this.state.billing_state}
              onChange={this.handleChange}
            >
              <option value=''>Seleccionar departamento</option>
              {this.state.departments
                .filter((department) =>
                  department.toLowerCase().includes(this.state.billingStateSearch.toLowerCase())
                )
                .map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
            </select>
          </div>


          <div className='global-form-group'>
            <span className='global-form-label'>
              Nueva ciudad de facturación (billing_city):
            </span>
            <select
              id='billing_city_new'
              className='global-form-input'
              value={this.state.selectedBillingCity || this.state.billing_city}
              onChange={this.handleChange}
            >
              <option value=''>Seleccionar ciudad</option>
              {this.state.cities
                .filter((city) =>
                  city.toLowerCase().includes(this.state.billingCitySearch.toLowerCase())
                )
                .map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
            </select>
          </div>


          <div className='global-form-group'>
            <span className='global-form-label'>
              Nuevo departamento de envío (shipping_state):
            </span>
            <select
              id='shipping_state_new'
              className='global-form-input'
              value={this.state.selectedShippingState || this.state.shipping_state}
              onChange={this.handleChange}
              disabled={this.state.shipping_state === ''}
            >
              <option value=''>Seleccionar departamento</option>
              {this.state.departments
                .filter((department) =>
                  department.toLowerCase().includes(this.state.shippingStateSearch.toLowerCase())
                )
                .map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
            </select>
          </div>

          <div className='global-form-group'>
            <span className='global-form-label'>
              Nueva ciudad de envío (shipping_city):
            </span>
            <select
              id='shipping_city_new'
              className='global-form-input'
              value={this.state.selectedShippingCity || this.state.shipping_city}
              onChange={this.handleChange}
              disabled={this.state.shipping_city === ''}
            >
              <option value=''>Seleccionar ciudad</option>
              {this.state.cities
                .filter((city) =>
                  city.toLowerCase().includes(this.state.shippingCitySearch.toLowerCase())
                )
                .map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
            </select>
          </div>

          <div className='global-form-buttons-container'>
            <button
              className='global-form-solid-button'
              onClick={this.ModifyOrder}
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
    )
  }
}

export default ModifyOrderById
