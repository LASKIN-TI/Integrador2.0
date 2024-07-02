import React, { Component } from 'react';
import './Styles.css';
import Alert from '../Alerts/Alert';
import { getElements } from '../../Functions/Get';
import { formatPrice } from '../../Functions/Helpers';
import { simpleRequest } from '../../Functions/Post';
import Modal from './ModalProceduresTags';
import ModalHourShopify from './ModalHourShopify';
import ModalHourHW from './ModalHourHW';
import { recursiveEnqueue, recursiveEnqueueUpdate } from '../../Functions/HelpersAWS';
import {
    PROCEDURES_SHOPIFY,
    PROCEDURES_HW,
    ERROR_MESSAGE,
    ALERT_TIMEOUT,
    NO_ITEMS_ERROR,
    CREATE_DATE,
    DATE_HW,
    DATE_PROCEDURES
} from '../../Functions/Constants';

class SyncProcedures extends Component {
    constructor() {
        super();
        this.state = {
            proceduresShopify: [],
            proceduresShopify2: [],
            proceduresHW: [],
            changedProcedures: [],
            alert: null,
            timeout: null,
            currentPage: 1,
            proceduresPerPage: 100,
            isLoading: false,
            paginationEnabled: true,
            selectedOption: 'todos',
            updatedOn: '',
            hasErrors: false,
            is_processing: false,
            pending_update: false,
            dateHW: '',
            date_rabbit: '',
            responsible: '',
            dataLoaded: false,
            cantidadProcedimientosModificar: 0,
            cantidadProcedimientosCrear: 0,
            cantidadProcedimientosArchivar: 0,
            cantidadProcedimientosActivar: 0,
            cantidadProcedimientosEstado: 0,
        };
        this.refreshView = this.refreshView.bind(this);
    }

    componentDidMount() {
        let session_id = sessionStorage.getItem('user_id');
        this.setState({ isLoading: true, dataLoaded: false });
        getElements('proceduresShopify', PROCEDURES_SHOPIFY, this.setProceduresShopify);
        getElements('proceduresHW', PROCEDURES_HW, this.setProceduresHW);
        getElements('dateHW', DATE_HW, this.setDateHW)
        getElements('dateProcedures', DATE_PROCEDURES, this.setDateProcedures)
    }

    refreshView = () => {
        getElements('proceduresShopify', PROCEDURES_SHOPIFY, this.setProceduresShopify);
        getElements('proceduresHW', PROCEDURES_HW, this.setProceduresHW);
        getElements('dateHW', DATE_HW, this.setDateHW)
        getElements('dateProcedures', DATE_PROCEDURES, this.setDateProcedures)
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

    handlePageChange = (pageNumber) => {
        this.setState({ currentPage: pageNumber });
    };

    handleSelectChange = (event) => {
        const selectedOption = event.target.value;
        const paginationEnabled = selectedOption === 'todos';

        this.setState({ selectedOption, paginationEnabled });
    };


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

    responseHandler = (response, body) => {
        if (response === 'success') {
            getElements('proceduresShopify', PROCEDURES_SHOPIFY, this.setProceduresShopify);
            return this.buildAlert(
                'success',
                'La solicitud ha sido procesada exitosamente.'
            );
        }
        return this.buildAlert('error', ERROR_MESSAGE);
    };

    setProceduresShopify = async (response, body) => {
        if (response === 'success') {
            let proceduresShopify = body.procedures.map((procedure) => {
                let tagsWithPrefix = [];
                let tagsWithoutPrefix = [];

                procedure.tags.split(',').forEach(tag => {
                    const parts = tag.split('.');
                    if (parts.length === 2 && (parts[0] === '001' || parts[0] === '002' || parts[0] === '003' || !isNaN(parseInt(parts[0])))) {
                        tagsWithPrefix.push(tag.trim());
                    } else if (tag.includes('-')) {
                        tagsWithPrefix.push(tag.trim());
                    } else {
                        const tagName = tag.trim();
                        if (tagsWithPrefix.some(prefixTag => prefixTag.split('.')[1] === tagName)) {
                            tagsWithoutPrefix.push(tagName);
                        }
                    }
                });

                let finalTags = [...tagsWithPrefix, ...tagsWithoutPrefix].sort();

                procedure.tags = finalTags.join(', ');
                return procedure;
            });

            this.setState({ proceduresShopify, shopifyDataLoaded: true });

        } else if (body === NO_ITEMS_ERROR) {
            this.buildAlert('attention', NO_ITEM_MESSAGE);
        } else {
            this.buildAlert('error', ERROR_MESSAGE);
        }
    };



    setProceduresShopify2 = async (response, body) => {
        if (response === 'success') {
            let proceduresShopify2 = body.procedures.map((procedure) => ({
                ...procedure,
            }));

            this.setState({ proceduresShopify2, shopifyDataLoaded: true });
            //console.log(proceduresShopify);
        } /* else if (body === NO_ITEMS_ERROR) {
    this.buildAlert('attention', NO_ITEM_MESSAGE);
  }  else {
    this.buildAlert('error', ERROR_MESSAGE);
  } */
    };

    setProceduresHW = async (response, body) => {
        //this.setState({ isLoading: false });
        if (response === 'success') {
            let proceduresHW = body.procedures.map((procedure) => ({
                ...procedure,
            }));
            proceduresHW.sort((a, b) => a.variants[0].sku.localeCompare(b.variants[0].sku));
            this.setState({ proceduresHW });

        } else if (body === NO_ITEMS_ERROR) {
            this.buildAlert('attention', NO_ITEM_MESSAGE);
        } else {
            this.buildAlert('error', ERROR_MESSAGE);
        }
    };


    setDateHW = async (response, body) => {
        this.setState({ isLoading: false });
        if (response === 'success') {
            const responseData = body.date;
            this.setState({
                updatedOn: responseData.updated_on,
                hasErrors: responseData.has_errors,
                is_processing: responseData.is_processing,
                pending_update: responseData.pending_update,
            });
        } else if (body === NO_ITEMS_ERROR) {
            this.buildAlert('attention', NO_ITEMS_ERROR);
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


    findMissingProcedures = (proceduresHW) => {
        const { proceduresShopify } = this.state;
        return proceduresShopify.filter((shopifyProcedure) => {
            return !proceduresHW.some(
                (hwProcedure) => hwProcedure.variants[0].sku === shopifyProcedure.variants[0].sku
            );
        });
    };

    findChangedProcedures = () => {
        const { proceduresHW, proceduresShopify } = this.state;

        const normalizeTags = (tags) => tags.split(', ').map(tag => tag.trim()).sort().join(', ');

        const findMatchingProcedureBySKU = (sku) => {
            return proceduresShopify.find((procedure) => procedure.variants[0].sku === sku);
        };

        let changedProcedures = [];
        proceduresHW.forEach((obj) => {
            const matchingProcedureShopify = findMatchingProcedureBySKU(obj.variants[0].sku);

            if (matchingProcedureShopify) {
                const oldTags = matchingProcedureShopify.tags;
                const newTags = obj.tags;
                const oldPrice = matchingProcedureShopify.variants[0].price;
                const newPrice = obj.variants[0].price;

                const oldTagsNormalized = normalizeTags(oldTags);
                const newTagsNormalized = normalizeTags(newTags);

                if (oldTagsNormalized !== newTagsNormalized) {
                    obj.tags = newTagsNormalized;
                    const tagChange = `${oldTags} → ${newTags}`;
                    obj.tagChange = tagChange;
                } else {
                    obj.tagChange = '';
                }

                if (oldPrice !== newPrice) {
                    const priceChange = `${oldPrice} → ${newPrice}`;
                    obj.priceChange = priceChange;
                } else {
                    obj.priceChange = '';
                }

                if (obj.variants[0].taxable !== matchingProcedureShopify.variants[0].taxable) {
                    const oldTax = matchingProcedureShopify.variants[0].taxable;
                    const newTax = obj.variants[0].taxable;
                    obj.TaxChange = `${oldTax} → ${newTax}`;
                    obj.shopifyId = matchingProcedureShopify.id;
                } else {
                    obj.TaxChange = '';
                }

                if (obj.variants[0].barcode !== matchingProcedureShopify.variants[0].barcode) {
                    const oldBarcode = matchingProcedureShopify.variants[0].barcode;
                    const newBarcode = obj.variants[0].barcode;
                    obj.barcodeChange = `${oldBarcode} → ${newBarcode}`;
                    obj.shopifyId = matchingProcedureShopify.id;
                } else {
                    obj.barcodeChange = '';
                }

                if (obj.priceChange !== '' || obj.tagChange !== '' || obj.TaxChange || obj.barcodeChange) {
                    changedProcedures.push(obj);
                }
            }
        });

        return changedProcedures;
    };


    checkIfProcedureExist = (sku) => {
        const { proceduresShopify } = this.state;
        return proceduresShopify.some((procedure) => procedure.variants[0].sku === sku)
    }

    createProcedures = async () => {
        const { proceduresHW, shopifyDataLoaded } = this.state;
        if (!shopifyDataLoaded) {
            this.buildAlert('attention', 'Cargando los procedimientos de Shopify...');
            return;
        }

        let proceduresToCreate = [];

        for (const procedure of proceduresHW) {
            const skuExistsInShopify = this.checkIfProcedureExist(procedure.variants[0].sku);
            if (!skuExistsInShopify) {
                proceduresToCreate.push(procedure);
            }
        }

        const cantidadProcedimientosCrear = proceduresToCreate.length;
        this.setState({ cantidadProcedimientosCrear });

        if (proceduresToCreate.length === 0) {
            this.buildAlert('success', 'Sincronización completa');
            return;
        } else {
            //console.log('Procedimientos para crear:', proceduresToCreate);
            this.buildAlert('success', 'Se están creando los procedimientos');
        }

        await recursiveEnqueue(proceduresToCreate, 0);

    };



    modifyProcedures = async () => {
        const { proceduresShopify, proceduresShopify2, shopifyDataLoaded, proceduresHW } = this.state;
        const changedProcedures = this.findChangedProcedures();

        if (!shopifyDataLoaded) {
            this.buildAlert('attention', 'Cargando los procedimientos de Shopify...');
            return;
        }

        let modifiedProceduresArray = [];

        for (const changedProcedure of changedProcedures) {
            const shopifyProcedure = proceduresShopify2.find(
                (p) => p.variants[0].sku === changedProcedure.variants[0].sku
            );

            if (shopifyProcedure) {
                const shopify_id = shopifyProcedure.id;
                this.close();

                const {
                    title,
                    inventoryChange,
                    shopifyId,
                    status,
                    TaxChange,
                    barcodeChange,
                    statushw,
                    priceChange,
                    tagChange,
                    product_type,
                    published_at,
                    body_html,
                    template_suffix,
                    published,
                    ...body
                } = changedProcedure;

                body.variants[0].inventory_management = null;
                body.variants[0].inventory_quantity = 0;
                delete body.variants[0].option1;

                // Identificar los tags que no tienen guión en shopifyProcedure
                let matchingTags = shopifyProcedure.tags.split(', ');

                matchingTags = matchingTags.filter(tag => !tag.includes('-'));

                // Variable A, B, C
                let variableA = "NO APLICA";
                let variableB = "NO APLICA";
                let variableC = "NO APLICA";

                matchingTags.forEach(tag => {
                    if (tag.startsWith("001.")) {
                        variableA = tag.slice(4); // Quita los primeros 4 caracteres
                    } else if (tag.startsWith("002.")) {
                        variableB = tag.slice(4); // Quita los primeros 4 caracteres
                    } else if (tag.startsWith("003.")) {
                        variableC = tag.slice(4); // Quita los primeros 4 caracteres
                    }
                });

                if (matchingTags.length > 0) {
                    const newTags = body.tags.split(', ');

                    // Filtra los tags que tengan prefijo antes de agregarlos
                    const cleanMatchingTags = matchingTags.filter(tag => !tag.startsWith("001.") && !tag.startsWith("002.") && !tag.startsWith("003."));

                    // Quita los tags que tengan el mismo valor que las variables A, B y C
                    const filteredTags = cleanMatchingTags.filter(tag => tag !== variableA && tag !== variableB && tag !== variableC);

                    // Filtra los tags que no son "NO APLICA"
                    const validTags = filteredTags.filter(tag => tag !== "NO APLICA");

                    newTags.push(...validTags);

                    body.tags = newTags.join(', ');
                }

                body.id = shopify_id;

                modifiedProceduresArray.push({
                    ...body,
                    variableA,
                    variableB,
                    variableC
                });
            } else {
                modifiedProceduresArray.push(changedProcedure);
            }
        };

        const cantidadProcedimientosModificar = modifiedProceduresArray.length;
        this.setState({ cantidadProcedimientosModificar });

        console.log('Procedimientos para modificar:', modifiedProceduresArray);

        if (modifiedProceduresArray.length === 0) {
            this.buildAlert('success', 'Sincronización completa');
            return;
        } else {
            this.buildAlert('success', 'Se están actualizando los procedimientos');
            await recursiveEnqueueUpdate(modifiedProceduresArray, 0);
        }
    };


    updateMissingProcedures = async () => {
        const { proceduresHW, shopifyDataLoaded, proceduresShopify } = this.state;

        // Filter out archived products from the missing products list
        const missingProcedures = this.findMissingProcedures(proceduresHW).filter(
            (procedure) => procedure.status !== 'archived'
        );

        const updatedMissingProcedures = missingProcedures.map((procedure) => ({
            ...procedure,
            status: 'archived',
            published: false
        }));

        const cantidadProcedimientosArchivar = updatedMissingProcedures.length;
        this.setState({ cantidadProcedimientosArchivar });


        if (updatedMissingProcedures.length === 0) {
            return;
        }

        //console.log('Procedimiento para archivar', updatedMissingProcedures);

        await recursiveEnqueueUpdate(updatedMissingProcedures, 0);

    };

    findArchivedP = (proceduresHW, proceduresShopify) => {
        // Filtrar los productos archivados en productsShopify
        const archivedProceduresInShopify = proceduresShopify.filter(
            (shopifyProcedure) => shopifyProcedure.status === 'archived'
        );

        // Encontrar los productos que coinciden entre productsHW y archivedProductsInShopify
        return archivedProceduresInShopify.filter((shopifyProcedure) =>
            proceduresHW.some(
                (hwProcedure) => hwProcedure.variants[0].sku === shopifyProcedure.variants[0].sku
            )
        );
    };

    // Función para actualizar el estado de los productos archivados a un nuevo estado
    updateArchivedProcedures = (archivedProcedures, newStatus) => {
        // Actualizar el estado de los productos archivados al nuevo estado deseado
        return archivedProcedures.map((procedure) => ({
            ...procedure,
            status: newStatus,
            published: false,
        }));
    };

    getArchivedProceduresFromHW = async () => {
        const { proceduresHW, proceduresShopify } = this.state;
        const archivedProcedures = this.findArchivedP(proceduresHW, proceduresShopify);
        const updatedArchivedProcedures = this.updateArchivedProcedures(
            archivedProcedures,
            'draft'
        );

        const cantidadProcedimientosActivar = updatedArchivedProcedures.length;
        this.setState({ cantidadProcedimientosActivar });
        //console.log('Procedimientos para activar', updatedArchivedProcedures);

        if (updatedArchivedProcedures.length > 0) {
            await recursiveEnqueueUpdate(updatedArchivedProcedures, 0);
        } else {
            // El arreglo updatedArchivedProcedures está vacío, no hacemos nada.
            //console.log("El arreglo updatedArchivedProcedures está vacío, no se ejecutaron las funciones.");
        }
    };

    saveDates = () => {
        let name = sessionStorage.getItem('user_name')
        this.close();

        const { updatedOn } = this.state;
        const currentDate = new Date();

        // Obtener los componentes de la fecha actual
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Sumar 1 al mes ya que los meses comienzan en 0
        const day = String(currentDate.getDate()).padStart(2, '0');
        const hours = String(currentDate.getHours()).padStart(2, '0');
        const minutes = String(currentDate.getMinutes()).padStart(2, '0');
        const seconds = String(currentDate.getSeconds()).padStart(2, '0');

        // Formatear la fecha en el formato deseado
        const formattedDate = `${year}.${month}.${day}  ${hours}:${minutes}:${seconds}`;

        const cantidadProcedimientosModificar = this.state.cantidadProcedimientosModificar
        const cantidadProcedimientosCrear = this.state.cantidadProcedimientosCrear
        const cantidadProcedimientosArchivar = this.state.cantidadProcedimientosArchivar
        const cantidadProcedimientosActivar = this.state.cantidadProcedimientosActivar
        const cantidadProcedimientosEstado = this.state.cantidadProcedimientosEstado

        let total = cantidadProcedimientosModificar + cantidadProcedimientosCrear +
            cantidadProcedimientosArchivar + cantidadProcedimientosActivar + cantidadProcedimientosEstado

        const body = {
            fechaActual: formattedDate,
            fechaUpdatedOn: updatedOn,
            estado: 'PROCEDIMIENTO',
            responsible: name,
            qty: total
        };

        //console.log(body);

        simpleRequest(CREATE_DATE, 'POST', body, this.responseHandler);
        this.buildAlert('success', 'Sincronización completa')
    };

    updateProceduresPublished = async () => { // Agregar la palabra clave 'async' aquí
        const { proceduresShopify, proceduresHW } = this.state;

        const activeUnpublishedProcedures = [];

        for (const procedureShopify of proceduresShopify) {
            // Verifica si el procedimiento en Shopify está activo y no está publicado
            if (procedureShopify.status === 'active' && procedureShopify.published_at === '') {
                // Busca el procedimiento correspondiente en proceduresHW
                const matchingProcedureHW = proceduresHW.find(
                    (procedure) => procedure.variants[0].sku === procedureShopify.variants[0].sku
                );

                // Verifica si se encontró un procedimiento coincidente y si su estado es "publish"
                if (matchingProcedureHW && matchingProcedureHW.statushw === 'publish') {
                    // Cambia el estado del procedimiento a "active" y establece published en true
                    const { tags, ...updatedProcedure } = {
                        ...procedureShopify,
                        published: true,
                    };

                    activeUnpublishedProcedures.push(updatedProcedure);
                }
            } else if (procedureShopify.status === 'active' && procedureShopify.published_at !== '') {

                const matchingProcedureHW = proceduresHW.find(
                    (procedure) => procedure.variants[0].sku === procedureShopify.variants[0].sku
                );

                if (matchingProcedureHW && matchingProcedureHW.statushw !== 'publish') {
                    const updatedProcedure = {
                        ...procedureShopify,
                        published_at: '',
                        published: false,
                    };

                    activeUnpublishedProcedures.push(updatedProcedure);
                }

            }
        }

        if (activeUnpublishedProcedures.length > 0) {
            // Actualiza el estado con los procedimientos actualizados
            this.setState({ proceduresShopify: activeUnpublishedProcedures });

            const cantidadProcedimientosEstado = activeUnpublishedProcedures.length;
            this.setState({ cantidadProcedimientosEstado });

            //console.log("PARA COLOCAR CANAL DE VENTA", activeUnpublishedProcedures);
            await recursiveEnqueueUpdate(activeUnpublishedProcedures, 0);
        } else {
            // El arreglo activeUnpublishedProcedures está vacío, no hacemos nada.
            // this.buildAlert('attention', 'No hay productos para actualizar.');
        }
    };



    setTableHW() {
        const {
            selectedOption,
            proceduresHW,
            proceduresShopify,
            currentPage,
            proceduresPerPage,
            paginationEnabled,
        } = this.state;

        if (proceduresHW.length < 1) {
            return (
                <span className='global-body-text' style={{ marginBottom: '0px' }}>
                    Actualmente no hay procedimientos con los filtros seleccionados.
                </span>
            );
        }

        const findMatchingProcedureBySKU = (sku) => {
            return proceduresShopify.find((procedure) => procedure.variants[0].sku === sku);
        };

        const normalizeTags = (tags) => tags.split(', ').map(tag => tag.trim()).sort().join(', ');

        let showAllProcedures = false;
        let filteredProcedures = [];

        if (selectedOption === 'todos') {
            showAllProcedures = true;
            filteredProcedures = proceduresHW;
        } else {
            filteredProcedures = proceduresHW.filter((obj) => {
                const matchingProcedureShopify = findMatchingProcedureBySKU(
                    obj.variants[0].sku
                );
                if (matchingProcedureShopify) {
                    const priceChange =
                        matchingProcedureShopify &&
                        obj.variants[0].price !== matchingProcedureShopify.variants[0].price;

                    const oldTags = matchingProcedureShopify.tags;
                    const newTags = obj.tags;

                    const oldTagsN = normalizeTags(oldTags);
                    const newTagsN = normalizeTags(newTags);

                    const tagChange =
                        matchingProcedureShopify &&
                        newTagsN !==
                        oldTagsN;

                    const barcodeChange =
                        matchingProcedureShopify &&
                        obj.variants[0].barcode !== matchingProcedureShopify.variants[0].barcode;


                    if (
                        (selectedOption === 'actualizar' && (priceChange || tagChange || barcodeChange))
                    ) {
                        return true;
                    }
                }
                if (
                    (selectedOption === 'nuevos' && !matchingProcedureShopify)
                ) {
                    return true;
                }
                return false;
            });
        }

        // Calcular el índice inicial y final de los procedimientos a mostrar en la página actual
        const indexOfLastProcedure = currentPage * proceduresPerPage;
        const indexOfFirstProcedure = indexOfLastProcedure - proceduresPerPage;
        const currentProcedures = filteredProcedures.slice(
            indexOfFirstProcedure,
            indexOfLastProcedure
        );

        const tableRows = currentProcedures.map((obj, index) => {
            const matchingProcedureShopify = findMatchingProcedureBySKU(
                obj.variants[0].sku
            );

            let priceChange = '';
            let tagChange = '';
            let barcodeChange = '';

            if (matchingProcedureShopify) {
                if (obj.variants[0].price !== matchingProcedureShopify.variants[0].price) {
                    const oldPrice = formatPrice(matchingProcedureShopify.variants[0].price);
                    const newPrice = formatPrice(obj.variants[0].price);
                    priceChange = `${oldPrice} → ${newPrice}`;
                }


                const oldTag = matchingProcedureShopify.tags;
                const newTag = obj.tags;
                if (oldTag && newTag) {
                    const oldTagN = normalizeTags(oldTag);
                    const newTagN = normalizeTags(newTag);

                    if (newTagN !== oldTagN) {
                        tagChange = `${oldTag} → ${newTag}`;
                    }
                }

                if (obj.variants[0].barcode !== matchingProcedureShopify.variants[0].barcode) {
                    const oldBarcode = matchingProcedureShopify.variants[0].barcode;
                    const newBarcode = obj.variants[0].barcode;
                    barcodeChange = `${oldBarcode} → ${newBarcode}`;
                }
            }


            let truncatedTitle = obj.title;
            if (truncatedTitle.length > 10) {
                truncatedTitle = truncatedTitle.substring(0, 25) + '...';
            }

            const notInShopify = !matchingProcedureShopify;
            const rowStyle = notInShopify ? { color: 'red' } : {};

            return (
                <tr key={'tr' + index} style={rowStyle}>
                    <td style={rowStyle}>{obj.variants[0].sku}</td>
                    <td style={rowStyle}>{truncatedTitle}</td>
                    <td style={rowStyle}>{formatPrice(obj.variants[0].price)}</td>
                    <td style={{ ...rowStyle, color: 'red' }}>{priceChange}</td>
                    <td style={rowStyle}>{obj.tags}</td>
                    <td style={{ ...rowStyle, color: 'red' }}>{tagChange}</td>
                    {/* <td style={rowStyle}>{obj.variants[0].barcode}</td>
                    <td style={{ ...rowStyle, color: 'red' }}>{barcodeChange}</td> */}
                </tr>
            );
        });

        let table = (
            <div>
                <table>
                    <tbody>
                        <tr>
                            <th>SKU</th>
                            <th>Nombre</th>
                            <th>Precio</th>
                            <th>Cambio de precio</th>
                            <th>Etiquetas</th>
                            <th>Cambio de etiquetas</th>
                        </tr>
                        {tableRows}
                    </tbody>
                </table>
            </div>
        );

        if (!showAllProcedures && paginationEnabled) {
            return (
                <div>
                    {table}
                    {this.renderPagination()}
                </div>
            );
        } else {
            return table;
        }
    }

    filterProcedures(selectedOption) {
        const { proceduresHW } = this.state;
        switch (selectedOption) {
            case 'todos':
                return proceduresHW;
            case 'nuevos':
                return proceduresHW.filter((obj) => !this.hasMatchingShopifyProcedure(obj.variants[0].sku)); // Mostrar solo los nuevos procedimientos
            case 'actualizar':
                return proceduresHW.filter((obj) => this.hasPriceOrInventoryChange(obj.variants[0].sku)); // Mostrar solo los procedimientos que requieren actualización
            default:
                return [];
        }
    }

    paginateProcedures(procedures, currentPage, proceduresPerPage) {
        const startIndex = (currentPage - 1) * proceduresPerPage;
        const endIndex = startIndex + proceduresPerPage;
        return procedures.slice(startIndex, endIndex);
    }

    hasPriceOrInventoryChange(sku) {
        const { proceduresShopify, proceduresHW } = this.state;

        const matchingProcedureShopify = proceduresShopify.find(
            (procedure) => procedure.variants[0].sku === sku
        );

        if (matchingProcedureShopify) {
            return (
                matchingProcedureShopify.variants[0].price !== proceduresHW.variants[0].price
            );
        }

        return false;
    }

    hasMatchingShopifyProcedure(sku) {
        const { proceduresShopify } = this.state;

        return proceduresShopify.some(
            (procedure) => procedure.variants[0].sku === sku
        );
    }

    handleHelpClick() {
        alert('Aquí encontrarás información sobre los procedimientos.');
    }



    renderPagination = () => {
        const { proceduresHW, proceduresPerPage, currentPage, paginationEnabled } = this.state;

        if (paginationEnabled) {
            const pageNumbers = Math.ceil(proceduresHW.length / proceduresPerPage);

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
        } else {
            return null;
        }
    };

    showModalTags = () => {
        return this.props.showModal(
            <Modal closeModal={this.closeModal} />
        );
    };

    showModalHourShopify = () => {
        return this.props.showModal(
            <ModalHourShopify closeModal={this.closeModal} />
        );
    };

    showModalHourHW = () => {
        return this.props.showModal(
            <ModalHourHW closeModal={this.closeModal} />
        );
    };


    closeModal = () => {
        return this.props.closeModal()
    }

    loadData = () => {
        getElements('proceduresShopify', PROCEDURES_SHOPIFY, this.setProceduresShopify);
        getElements('proceduresShopify2', PROCEDURES_SHOPIFY, this.setProceduresShopify2);
        //getElements('proceduresHW', PROCEDURES_HW, this.setProceduresHW);
        this.setState({ dataLoaded: true });
    };



    render() {
        const { isLoading, selectedOption, updatedOn, hasErrors, is_processing, pending_update, dataLoaded } = this.state;
        const currentDate = new Date();
        const updatedOnDate = new Date(updatedOn.replace(/(\d{4})\.(\d{2})\.(\d{2}) (\d{2}):(\d{2}):(\d{2})/, "$1-$2-$3T$4:$5:$6"));
        const isFechaSuperior = currentDate > updatedOnDate;
        const isValid = isFechaSuperior && !hasErrors && !is_processing && !pending_update;


        if (isLoading) {
            return (
                <div className="cu-container">
                    <div className="spinner-container">
                        <div className="spinner"></div>
                    </div>
                </div>
            );
        }

        let tableHW = this.setTableHW();

        return (
            <div className='cu-container'>
                {this.state.alert}
                <span className='global-comp-title'>Procedimientos</span>
                <div className='global-comp-description-container'>
                    <span className='global-comp-description'>
                        Aquí podrá visualizar todos los procedimientos.
                    </span>
                    <div
                        id='eye-icon-container-1'
                        className='global-form-img-container'
                        style={{ cursor: 'pointer', paddingBottom: '20px' }}
                        onClick={this.showModalTags}
                    >
                        <img
                            id='eye-icon-1'
                            className='global-form-img'
                            src='./question-gray.png'
                            alt='eye'
                        />
                    </div>
                </div>
                <div className='global-comp-form-container'>
                    <div className='global-special-form-group'>
                        <select
                            id=''
                            className='global-special-form-input-select'
                            onChange={this.handleSelectChange}
                            value={selectedOption}
                        >
                            <option value='todos'>Todos</option>
                            <option value='nuevos'>Para Crear</option>
                            <option value='actualizar'>Para Actualizar</option>
                        </select>
                        <button
                            className='global-form-solid-button sync-button'
                            onClick={this.refreshView}
                        >
                            Refrescar
                        </button>
                        <button
                            className='global-form-solid-button sync-button'
                            onClick={this.loadData}
                        >
                            Cargar
                        </button>
                        <button
                            className='global-form-solid-button sync-button'
                            onClick={async () => {
                                if (isValid) {
                                    // Esperar a que todas las acciones anteriores se completen.
                                    await Promise.all([
                                        this.createProcedures(),
                                        this.modifyProcedures(),
                                        this.updateMissingProcedures(),
                                        this.getArchivedProceduresFromHW(),
                                        this.updateProceduresPublished(),
                                    ]);

                                    // Luego, ejecutar this.saveDates().
                                    this.saveDates();
                                } else {
                                    this.buildAlert('error', "No se puede sincronizar en el momento");
                                }
                            }}
                        >
                            Sincronizar
                        </button>
                    </div>
                    <div className='global-comp-description-container'>
                        <div className="updated-on-container">
                            Última sincronización hacia Shopify: {this.state.date_rabbit} // {this.state.responsible}
                        </div>
                        <div
                            id='question-icon-container-1'
                            className='global-form-img-container'
                            style={{ cursor: 'pointer', paddingTop: '5px', paddingLeft: '5px' }}
                            onClick={this.showModalHourShopify}
                        >
                            <img
                                id='eye-icon-1'
                                className='global-form-img'
                                src='./question-gray.png'
                                alt='question'
                            />
                        </div>
                    </div>
                    <div className='global-comp-description-container'>
                        <div className="updated-on-container">
                            Última sincronización de HistoWeb: {this.state.updatedOn}
                        </div>
                        <div
                            id='question-icon-container-1'
                            className='global-form-img-container'
                            style={{ cursor: 'pointer', paddingTop: '5px', paddingLeft: '5px' }}
                            onClick={this.showModalHourHW}
                        >
                            <img
                                id='eye-icon-1'
                                className='global-form-img'
                                src='./question-gray.png'
                                alt='question'
                            />
                        </div>
                    </div>
                    <div className="has-errors-container">
                        Errores: {this.state.hasErrors || this.state.is_processing || this.state.pending_update ? <span style={{ color: 'red' }}>Sí</span> : 'No'}
                    </div>
                    {dataLoaded ? (
                        <div>
                            <div className='pagination-container'>
                                {this.renderPagination()}
                            </div>
                            <div className='table-container'>
                                {tableHW}
                            </div>
                        </div>
                    ) : (
                        <div className='global-comp-title' style={{ paddingTop: '20px' }}>
                            ¡Carga los datos!
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default SyncProcedures;