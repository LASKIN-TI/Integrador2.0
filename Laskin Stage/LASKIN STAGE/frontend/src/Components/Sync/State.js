import React, { Component } from 'react'
import './Styles.css'

import Alert from '../Alerts/Alert'
import {
    validateString,
    validateEmail,
    setSelectOptions,
} from '../../Functions/Helpers'
import { simpleRequest3 } from '../../Functions/Post'
import { getElements } from '../../Functions/Get';

import {
    MANDATORY_MESSAGE,
    EMAIL_MESSAGE,
    ERROR_MESSAGE,
    ALERT_TIMEOUT,
    INVALID_STRING_MESSAGE,
    NO_ITEMS_ERROR,
    DATE_HW,
    DATE_PRODUCTS,
    DATE_PROCEDURES,
    DATE_AUTOMATIC_PRODUCT,
    DATE_AUTOMATIC_PROCEDURE
} from '../../Functions/Constants'

class State extends Component {
    constructor() {
        super()
        this.state = {
            alert: '',
            timeout: '',
            date_products_manual: '',
            responsible_products: '',
            date_procedures_manual: '',
            responsible_procedures: '',
            date_automatic_product: '',
            responsible_automatic_product: '',
            date_automatic_procedure: '',
            responsible_automatic_procedure: '',
            qty_products: '',
            qty_procedures: '',
            qty_automatic_products: '',
            qty_automatic_procedures: '',
            isLoading: false,

        }
    }

    componentWillUnmount() {
        clearTimeout(this.state.timeout)
    }

    componentDidMount() {
        let session_id = sessionStorage.getItem('user_id');
        this.setState({ isLoading: true });
        getElements('dateHW', DATE_HW, this.setDateHW);
        getElements('dateProducts', DATE_PRODUCTS, this.setDateProducts)
        getElements('dateProcedures', DATE_PROCEDURES, this.setDateProcedures)
        getElements('dateAutomaticproduct', DATE_AUTOMATIC_PRODUCT, this.setDateAutomaticProduct)
        getElements('dateAutomaticprocedure', DATE_AUTOMATIC_PROCEDURE, this.setDateAutomaticProcedure)

    }


    // Functions to handle states
    handleChange = (event) => {
        let attribute = event.target.id
        let value = event.target.value

        return this.setState({ [attribute]: value })
    }

    setDateHW = async (response, body) => {
        this.setState({ isLoading: false });
        if (response === 'success') {
            const responseData = body.date;
            this.setState({
                updatedOn: responseData.updated_on,
                hasErrors: responseData.has_errors,
                is_processing: responseData.is_processing,
                pending_update: responseData.pending_update
            });
            //console.log('DATEHW', responseData);
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
                date_products_manual: responseData.date_rabbit,
                responsible_products: responseData.responsible,
                qty_products: responseData.qty,
            });
            //console.log('DATERABBIT', responseData.date_rabbit);
        } else if (body === NO_ITEMS_ERROR) {
            this.buildAlert('attention', NO_ITEMS_ERROR);
        } else {
            this.buildAlert('error', ERROR_MESSAGE);
        }
    }

    setDateProcedures = async (response, body) => {
        if (response === 'success') {
            const responseData = body.lastProcedureDate;
            this.setState({
                date_procedures_manual: responseData.date_rabbit,
                responsible_procedures: responseData.responsible,
                qty_procedures: responseData.qty,
            });
            //console.log('DATERABBIT', responseData.date_rabbit);
        } else if (body === NO_ITEMS_ERROR) {
            this.buildAlert('attention', NO_ITEMS_ERROR);
        } else {
            this.buildAlert('error', ERROR_MESSAGE);
        }
    }

    setDateAutomaticProduct = async (response, body) => {
        if (response === 'success') {
            const responseData = body.automaticDate;
            this.setState({
                date_automatic_product: responseData.date_rabbit,
                responsible_automatic_product: responseData.responsible,
                qty_automatic_products : responseData.qty
            });
            //console.log('DATERABBIT', responseData.date_rabbit);
        } else if (body === NO_ITEMS_ERROR) {
            this.buildAlert('attention', NO_ITEMS_ERROR);
        } else {
            this.buildAlert('error', ERROR_MESSAGE);
        }
    }

    setDateAutomaticProcedure = async (response, body) => {
        if (response === 'success') {
            const responseData = body.automaticDate;
            this.setState({
                date_automatic_procedure: responseData.date_rabbit,
                responsible_automatic_procedure: responseData.responsible,
                qty_automatic_procedures : responseData.qty
            });
            //console.log('DATERABBIT', responseData.date_rabbit);
        } else if (body === NO_ITEMS_ERROR) {
            this.buildAlert('attention', NO_ITEMS_ERROR);
        } else {
            this.buildAlert('error', ERROR_MESSAGE);
        }
    }


    setTable() {
        const { hasErrors, is_processing, pending_update } = this.state;


        return (
            <table>
                <tbody>
                    <tr>
                        <th>ID Proceso</th>
                        <th>Nombre</th>
                        <th>Última ejecución</th>
                        <th>Registros</th>
                    </tr>
                    <tr>
                        <td>SP01</td>
                        <td>Sincronización con HistoWeb</td>
                        <td>{this.state.updatedOn}</td>
                        <td>No Aplica</td>
                    </tr>
                    <tr>
                        <td>SP02</td>
                        <td>Sincronización manual de productos</td>
                        <td>{this.state.date_products_manual}</td>
                        <td>{this.state.qty_products}</td>
                        <td>

                        </td>
                    </tr>
                    <tr>
                        <td>SP03</td>
                        <td>Sincronización manual de procedimientos</td>
                        <td>{this.state.date_procedures_manual}</td>
                        <td>{this.state.qty_procedures}</td>

                    </tr>
                    <tr>
                        <td>SP04</td>

                        <td>Sincronización automática de productos</td>
                        <td>{this.state.date_automatic_product}</td>
                        <td>{this.state.qty_automatic_products}</td>

                        <td>

                        </td>
                    </tr>
                    <tr>
                        <td>SP05</td>
                        <td>Sincronización automática de procedimientos</td>
                        <td>{this.state.date_automatic_procedure}</td>
                        <td>{this.state.qty_automatic_procedures}</td>

                    </tr>
                </tbody>
            </table>
        );
    }


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

    // Functions related to requests
    responseHandler = (response, body) => {
        if (response === 'success') {
            this.buildAlert('success', 'Solicitud procesada con éxito.');
        } else {
            this.buildAlert('error', ERROR_MESSAGE);
        }
    }


    render() {
        const { isLoading } = this.state;

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
                <span className='global-comp-title'>Estado de la sincronización</span>
                <span className='global-comp-description'>
                    Aquí podrás ver el estado de la sincronización.
                </span>
                <div className='global-comp-form-container'>
                    <div className='global-form-group'>
                        {table}
                    </div>

                </div>
            </div>
        )
    }
}

export default State
