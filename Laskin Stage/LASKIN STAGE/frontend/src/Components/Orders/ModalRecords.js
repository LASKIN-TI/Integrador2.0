import React, { Component } from 'react'
import './Styles.css'

class ModalRecords extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  closeModal = () => {
    return this.props.closeModal();
  }

  render() {
    const { orders } = this.props; // Obtén las órdenes de las props

    // Filtrar las órdenes con error (código diferente de 0 o 368)
    const ordersWithError = orders.filter(order => order.code !== 0 && order.code !== 368);

    return (
      <div className='global-modal-background'>
        <div className='global-modal-container'>
          <div className='global-modal-header'>
            <span className='global-modal-title'>Órdenes</span>
            <img
              className='global-modal-icon'
              src='./close-white.png'
              alt='close'
              onClick={this.closeModal}
            />
          </div>

          <div className='global-modal-body'>
            {ordersWithError.length === 0 ? (
              <div className='global-modal-no-orders'>
                No hay órdenes con errores.
              </div>
            ) : (
              ordersWithError.map((order, index) => (
                <div key={index} className='global-modal-group-container'>
                  <div className='order-info'>
                    <span className='global-form-label'>Order_ref: </span>
                    <span className='global-modal-text'>{order.order_ref}</span>
                  </div>
                  <div className='order-info'>
                    <span className='global-form-label'>ID Shopify: </span>
                    <span className='global-modal-text'>{order.id_shopify}</span>
                  </div>
                  <div className='order-info'>
                    <span className='global-form-label'>Error: </span>
                    <span className='global-modal-text'>{order.message}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default ModalRecords;
