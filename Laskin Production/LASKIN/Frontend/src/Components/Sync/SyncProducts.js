import React, { Component } from 'react';
import './Styles.css';
import Alert from '../Alerts/Alert';
import { getElements } from '../../Functions/Get';
import { formatPrice, formatPriceCompare } from '../../Functions/Helpers';
import { simpleRequest } from '../../Functions/Post';
import Modal from './ModalProductsTags'
import ModalHourShopify from './ModalHourShopify';
import ModalHourHW from './ModalHourHW';

import { recursiveEnqueue, recursiveEnqueueUpdate } from '../../Functions/HelpersAWS'
import {
  PRODUCTS_SHOPIFY,
  PRODUCTS_HW,
  ERROR_MESSAGE,
  ALERT_TIMEOUT,
  NO_ITEMS_ERROR,
  DATE_HW,
  CREATE_DATE,
  DATE_PRODUCTS,
} from '../../Functions/Constants';

class SyncProducts extends Component {
  constructor() {
    super();
    this.state = {
      productsShopify: [],
      productsShopify2: [],
      productsHW: [],
      changedProducts: [],


      alert: null,
      timeout: null,


      currentPage: 1,
      productsPerPage: 100,
      isLoading: false,
      paginationEnabled: true,

      
      selectedOption: 'todos',
      updatedOn: '',
      hasErrors: false,
      is_processing: false,
      pending_update: false,
      date_rabbit: '',
      responsible: '',
      dataLoaded: false,
      cantidadProductosModificar: 0,
      cantidadProductosCrear: 0,
      cantidadProductosArchivar: 0,
      cantidadProductosActivar: 0,
      cantidadProductosEstado: 0,

    };
    this.refreshView = this.refreshView.bind(this); // Agrega esta línea
  }

  componentDidMount() {
    let session_id = sessionStorage.getItem('user_id');
    this.setState({ isLoading: true });
    getElements('productsShopify', PRODUCTS_SHOPIFY, this.setProductsShopify);
    getElements('productsHW', PRODUCTS_HW, this.setProductsHW);
    getElements('dateHW', DATE_HW, this.setDateHW)
    getElements('dateProducts', DATE_PRODUCTS, this.setDateProducts)
  }


  refreshView = () => {
    getElements('productsShopify', PRODUCTS_SHOPIFY, this.setProductsShopify);
    getElements('productsHW', PRODUCTS_HW, this.setProductsHW);
    getElements('dateHW', DATE_HW, this.setDateHW)
    getElements('dateProducts', DATE_PRODUCTS, this.setDateProducts)
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
      getElements('productsShopify', PRODUCTS_SHOPIFY, this.setProductsShopify);
      return this.buildAlert(
        'success',
        'La solicitud ha sido procesada exitosamente.'
      );
    }
    return this.buildAlert('error', ERROR_MESSAGE);
  };

  setProductsShopify = async (response, body) => {
    if (response === 'success') {
      let productsShopify = body.products.map((product) => {
        let tagsWithPrefix = [];
        let tagsWithoutPrefix = [];

        product.tags.split(',').forEach(tag => {
          const parts = tag.split('.');
          if (parts.length === 2 && (parts[0] === '001' || parts[0] === '002' || parts[0] === '003' || !isNaN(parseInt(parts[0])))) {
            tagsWithPrefix.push(tag);
          } else {
            const tagName = parts[parts.length - 1].trim();
            if (tagsWithPrefix.some(prefixTag => prefixTag.split('.')[1] === tagName)) {
              tagsWithoutPrefix.push(tagName);
            }
          }
        });

        let finalTags = [...tagsWithPrefix, ...tagsWithoutPrefix];

        product.tags = finalTags.join(', ');
        return product;
      });

      this.setState({ productsShopify, shopifyDataLoaded: true });
    } else if (body === NO_ITEMS_ERROR) {
      this.buildAlert('attention', NO_ITEM_MESSAGE);
    } else {
      this.buildAlert('error', ERROR_MESSAGE);
    }
  };


  setProductsShopify2 = async (response, body) => {
    if (response === 'success') {
      let productsShopify2 = body.products.map((product) => ({
        ...product,
      }));

      this.setState({ productsShopify2, shopifyDataLoaded: true });
      //console.log(productsShopify2);
    } /* else if (body === NO_ITEMS_ERROR) {
this.buildAlert('attention', NO_ITEM_MESSAGE);
}  else {
this.buildAlert('error', ERROR_MESSAGE);
} */
  };

  setProductsHW = async (response, body) => {
    //this.setState({ isLoading: false });
    if (response === 'success') {
      let productsHW = body.products.map((product) => ({
        ...product,
      }));
      productsHW.sort((a, b) => a.variants[0].sku.localeCompare(b.variants[0].sku));
      this.setState({ productsHW });
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

  findMissingProducts = (productsHW) => {
    const { productsShopify } = this.state;
    return productsShopify.filter((shopifyProduct) => {
      return !productsHW.some(
        (hwProduct) => hwProduct.variants[0].sku === shopifyProduct.variants[0].sku
      );
    });
  };

  findChangedProducts = () => {
    const { productsHW, productsShopify } = this.state;

    const normalizeTags = (tags) => tags.split(', ').map(tag => tag.trim()).sort().join(', ');

    const findMatchingProductBySKU = (sku) => {
      return productsShopify.find((product) => product.variants[0].sku === sku);
    };

    let changedProducts = [];
    productsHW.forEach((obj) => {
      const matchingProductShopify = findMatchingProductBySKU(obj.variants[0].sku);

      if (matchingProductShopify) {

        const oldTags = matchingProductShopify.tags;
        const newTags = obj.tags;

        const oldTagsNormalized = normalizeTags(oldTags);
        const newTagsNormalized = normalizeTags(newTags);

        // Check for price change
        if (obj.variants[0].price !== matchingProductShopify.variants[0].price) {
          const oldPrice = formatPrice(matchingProductShopify.variants[0].price);
          const newPrice = formatPrice(obj.variants[0].price);
          obj.priceChange = `${oldPrice} → ${newPrice}`;
          obj.shopifyId = matchingProductShopify.id;
        } else {
          obj.priceChange = '';
        }

        // Check for inventory change
        if (obj.variants[0].inventory_quantity !== matchingProductShopify.variants[0].inventory_quantity) {
          const oldInventory = matchingProductShopify.variants[0].inventory_quantity;
          const newInventory = obj.variants[0].inventory_quantity;
          obj.inventoryChange = `${oldInventory} → ${newInventory}`;
          obj.inventoryChange2 = obj.variants[0].inventory_quantity.toString();
          obj.shopifyId = matchingProductShopify.id;
        } else {
          obj.inventoryChange = '';
        }

        if (oldTagsNormalized !== newTagsNormalized) {
          obj.tags = newTagsNormalized;
          const tagChange = `${oldTags} → ${newTags}`;
          obj.tagChange = tagChange;
        } else {
          obj.tagChange = '';
        }

        if (obj.variants[0].taxable !== matchingProductShopify.variants[0].taxable) {
          const oldTax = matchingProductShopify.variants[0].taxable;
          const newTax = obj.variants[0].taxable;
          obj.TaxChange = `${oldTax} → ${newTax}`;
          obj.shopifyId = matchingProductShopify.id;
        } else {
          obj.TaxChange = '';
        }

        if (obj.vendor !== matchingProductShopify.vendor) {
          const oldVendor = matchingProductShopify.vendor;
          const newVendor = obj.vendor;
          obj.vendorChange = `${oldVendor} → ${newVendor}`;
        } else {
          obj.vendorChange = '';
        }

        if (obj.variants[0].weight !== matchingProductShopify.variants[0].weight) {
          const oldWeight = matchingProductShopify.variants[0].weight;
          const newWeight = obj.variants[0].weight;
          obj.weightChange = `${oldWeight} → ${newWeight}`;
        } else {
          obj.weightChange = '';
        }

        if (obj.priceChange !== '' || obj.inventoryChange !== '' || obj.tagChange !== '' || obj.TaxChange || obj.vendorChange || obj.weightChange) {
          changedProducts.push(obj);
        }
      }
    });

    return changedProducts;
  };


  checkIfProductExist = (sku) => {
    const { productsShopify } = this.state;
    return productsShopify.some((product) => product.variants[0].sku === sku)
  }

  createProducts = async () => {
    const { productsHW, shopifyDataLoaded } = this.state;
    if (!shopifyDataLoaded) {
      this.buildAlert('attention', 'Cargando los productos de Shopify...'); // Optional: Show a message indicating data is not yet loaded
      return;
    }

    let productsToCreate = [];

    for (const product of productsHW) {
      const skuExistsInShopify = this.checkIfProductExist(product.variants[0].sku);
      if (!skuExistsInShopify) {
        productsToCreate.push(product);
      }
    }

    const cantidadProductosCrear = productsToCreate.length;
    this.setState({ cantidadProductosCrear });

    if (productsToCreate.length === 0) {
      this.buildAlert('success', 'Sincronización completa');
      return;
    } else {
      //console.log('Productos para crear:', productsToCreate);
      this.buildAlert('success', 'Se están creando los productos');
    }

    await recursiveEnqueue(productsToCreate, 0);
  };


  modifyProducts = async () => {
    const { productsShopify, productsShopify2, shopifyDataLoaded, productsHW } = this.state;
    const changedProducts = this.findChangedProducts();

    if (!shopifyDataLoaded) {
      this.buildAlert('attention', 'Cargardo los productos de Shopify...');
      return;
    }

    let modifiedProductsArray = [];

    for (const changedProduct of changedProducts) {
      const shopifyProduct = productsShopify2.find(
        (p) => p.variants[0].sku === changedProduct.variants[0].sku
      );

      if (shopifyProduct) {
        const shopify_id = shopifyProduct.id;
        const inventory_policy = shopifyProduct.variants[0].inventory_policy;
        this.close();

        const {
          title,
          inventoryChange,
          shopifyId,
          status,
          tagChange,
          TaxChange,
          vendorChange,
          weightChange,
          inventoryChange2,
          priceChange,
          body_html,
          inventory_management,
          template_suffix,
          published,
          product_type,
          ...body
        } = changedProduct;

        delete body.variants[0].inventory_management;
        delete body.variants[0].option1;
        delete body.variants[0].requires_shipping;

        const matchingTags = shopifyProduct.tags.split(', ');

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

        // Agregar esos tags a body.tags en changedProcedure
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
        body.variants[0].inventory_policy = inventory_policy;

        modifiedProductsArray.push({
          ...body,
          variableA,
          variableB,
          variableC
        });
      } else {
        modifiedProductsArray.push(changedProduct);
      }
    };

    const cantidadProductosModificar = modifiedProductsArray.length;
    this.setState({ cantidadProductosModificar });

    //console.log('PRODUCTOS PARA MODIFICAR:', modifiedProductsArray);

    if (cantidadProductosModificar === 0) {
      this.buildAlert('success', 'Sincronización completa')
    } else {
      this.buildAlert('success', 'Se están actualizando los productos')
      await recursiveEnqueueUpdate(modifiedProductsArray, 0);
    }
  }



  updateMissingProducts = async () => {
    const { productsHW } = this.state;

    const missingProducts = this.findMissingProducts(productsHW).filter(
      (product) => product.status !== 'archived'
    );

    const updatedMissingProducts = missingProducts.map((product) => ({
      ...product,
      status: 'archived',
      published: false,
    }));

    const cantidadProductosArchivar = updatedMissingProducts.length;
    this.setState({ cantidadProductosArchivar });

    if (updatedMissingProducts.length === 0) {
      // El arreglo está vacío, no ejecutamos las funciones
      return;
    }

    //console.log('Producto para archivar', updatedMissingProducts);

    await recursiveEnqueueUpdate(updatedMissingProducts, 0);

  };



  findArchivedP = (productsHW, productsShopify) => {
    // Filtrar los productos archivados en productsShopify
    const archivedProductsInShopify = productsShopify.filter(
      (shopifyProduct) => shopifyProduct.status === 'archived'
    );

    // Encontrar los productos que coinciden entre productsHW y archivedProductsInShopify
    return archivedProductsInShopify.filter((shopifyProduct) =>
      productsHW.some(
        (hwProduct) => hwProduct.variants[0].sku === shopifyProduct.variants[0].sku
      )
    );
  };

  // Función para actualizar el estado de los productos archivados a un nuevo estado
  updateArchivedProducts = (archivedProducts, newStatus) => {
    // Actualizar el estado de los productos archivados al nuevo estado deseado
    return archivedProducts.map((product) => ({
      ...product,
      status: newStatus,
      published: false,
    }));
  };

  getArchivedProductsFromHW = async () => {
    const { productsHW, productsShopify } = this.state;
    const archivedProducts = this.findArchivedP(productsHW, productsShopify);
    const updatedArchivedProducts = this.updateArchivedProducts(
      archivedProducts,
      'draft'
    );

    const cantidadProductosActivar = updatedArchivedProducts.length;
    this.setState({ cantidadProductosActivar });


    if (updatedArchivedProducts.length > 0) {
      await recursiveEnqueueUpdate(updatedArchivedProducts, 0)
    } else {

    }

  };

  updateProductsPublished = async () => {
    const { productsShopify } = this.state;

    const activeUnpublishedProducts = productsShopify.filter((product) => (
      product.status === 'active' && product.published_at === ''
    ));

    if (activeUnpublishedProducts.length > 0) {
      const updatedProducts = activeUnpublishedProducts.map((product) => {
        const { title, product_type, published_at, status, tags, vendor, ...updatedProduct } = product;

        return {
          ...updatedProduct,
          published: true,
        };
      });

      // Actualiza el estado de los productos con published: true
      this.setState({ productsShopify: updatedProducts });

      const cantidadProductosEstado = updatedProducts.length;
      this.setState({ cantidadProductosEstado });


      if (updatedProducts.length > 0) {
        //console.log(updatedProducts);
        await recursiveEnqueueUpdate(updatedProducts, 0);
      } else {
        // this.buildAlert('attention', 'No hay productos para actualizar.');
      }
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

    const cantidadProductosModificar = this.state.cantidadProductosModificar
    const cantidadProductosCrear = this.state.cantidadProductosCrear
    const cantidadProductosArchivar = this.state.cantidadProductosArchivar
    const cantidadProductosActivar = this.state.cantidadProductosActivar
    const cantidadProductosEstado = this.state.cantidadProductosEstado

    let total = cantidadProductosModificar + cantidadProductosCrear +
      cantidadProductosArchivar + cantidadProductosActivar + cantidadProductosEstado


    const body = {
      fechaActual: formattedDate,
      fechaUpdatedOn: updatedOn,
      estado: 'PRODUCTO',
      responsible: name,
      qty: total
    };
    //console.log(body);
    simpleRequest(CREATE_DATE, 'POST', body, this.responseHandler);
  };

  setTableHW() {
    const {
      selectedOption,
      productsHW,
      productsShopify,
      currentPage,
      productsPerPage,
      paginationEnabled,
    } = this.state;

    if (productsHW.length < 1) {
      return (
        <span className='global-body-text' style={{ marginBottom: '0px' }}>
          Actualmente no hay productos con los filtros seleccionados.
        </span>
      );
    }

    const findMatchingProductBySKU = (sku) => {
      return productsShopify.find((product) => product.variants[0].sku === sku);
    };

    const normalizeTags = (tags) => tags.split(', ').map(tag => tag.trim()).sort().join(', ');


    let showAllProducts = false;
    let filteredProducts = [];

    if (selectedOption === 'todos') {
      showAllProducts = true;
      filteredProducts = productsHW;
    } else {
      filteredProducts = productsHW.filter((obj) => {
        const matchingProductShopify = findMatchingProductBySKU(
          obj.variants[0].sku
        );
        if (matchingProductShopify) {
          const priceChange =
            matchingProductShopify &&
            obj.variants[0].price !== matchingProductShopify.variants[0].price;

          const inventoryChange =
            matchingProductShopify &&
            obj.variants[0].inventory_quantity !==
            matchingProductShopify.variants[0].inventory_quantity;

          const vendorChange =
            matchingProductShopify &&
            obj.vendor !==
            matchingProductShopify.vendor;

          const weightChange =
            matchingProductShopify &&
            obj.variants[0].weight !==
            matchingProductShopify.variants[0].weight;

          /* const tagChange =
            matchingProductShopify &&
            obj.tags !==
            matchingProductShopify.tags; */

          const oldTags = matchingProductShopify.tags;
          const newTags = obj.tags;

          const oldTagsN = normalizeTags(oldTags);
          const newTagsN = normalizeTags(newTags);

          const tagChange =
            matchingProductShopify &&
            newTagsN !==
            oldTagsN;

          /*  const taxChange =
           matchingProductShopify &&
           obj.variants[0].taxable !==
           matchingProductShopify.variants[0].taxable;
  */
          if (
            (selectedOption === 'actualizar' && (priceChange || inventoryChange || tagChange || vendorChange ||  weightChange))
          ) {
            return true;
          }

        }

        if (
          (selectedOption === 'nuevos' && !matchingProductShopify)
        ) {
          return true;
        }
        return false;
      });
    }

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(
      indexOfFirstProduct,
      indexOfLastProduct
    );

    const table_rows = currentProducts.map((obj, index) => {
      const matchingProductShopify = findMatchingProductBySKU(
        obj.variants[0].sku
      );
      let priceChange = '';
      let tagChange = '';

      if (
        matchingProductShopify &&
        obj.variants[0].price !== matchingProductShopify.variants[0].price
      ) {
        const oldPrice = formatPrice(matchingProductShopify.variants[0].price);
        const newPrice = formatPrice(obj.variants[0].price);
        priceChange = `${oldPrice} → ${newPrice}`;
      }

      let inventoryChange = '';
      if (
        matchingProductShopify &&
        obj.variants[0].inventory_quantity !==
        matchingProductShopify.variants[0].inventory_quantity
      ) {
        const oldInventory = matchingProductShopify.variants[0].inventory_quantity;
        const newInventory = obj.variants[0].inventory_quantity;
        inventoryChange = `${oldInventory} → ${newInventory}`;
      }

      if (matchingProductShopify) {
        const oldTag = matchingProductShopify.tags;
        const newTag = obj.tags;
        if (oldTag && newTag) {
          const oldTagN = normalizeTags(oldTag);
          const newTagN = normalizeTags(newTag);

          if (newTagN !== oldTagN) {
            tagChange = `${oldTag} → ${newTag}`;
          }
        }
      }
      /* if (
        matchingProductShopify &&
        obj.tags !==
        matchingProductShopify.tags
      ) {
        const oldTag = matchingProductShopify.tags;
        const newTag = obj.tags;
        tagChange = `${oldTag} → ${newTag}`
      } */

      /* let taxChange = '';
      if (
        matchingProductShopify &&
        obj.variants[0].taxable !==
        matchingProductShopify.variants[0].taxable
      ) {
        const oldTax = matchingProductShopify.variants[0].taxable;
        const newTax = obj.variants[0].taxable;
        taxChange = `${oldTax} → ${newTax}`;
      } */

      let truncatedTitle = obj.title;
      if (truncatedTitle.length > 10) {
        truncatedTitle = truncatedTitle.substring(0, 25) + '...';
      }


      let vendorChange = '';
      if (
        matchingProductShopify &&
        obj.vendor !==
        matchingProductShopify.vendor
      ) {
        const oldVendor = matchingProductShopify.vendor;
        const newVendor = obj.vendor;
        vendorChange = `${oldVendor} → ${newVendor}`
      }

      let weightChange = '';
      if (
        matchingProductShopify &&
        obj.variants[0].weight !==
        matchingProductShopify.variants[0].weight
      ) {
        const oldWeight = matchingProductShopify.variants[0].weight;
        const newWeight = obj.variants[0].weight;
        weightChange = `${oldWeight} → ${newWeight}`
      }

      const notInShopify = !matchingProductShopify;
      const rowStyle = notInShopify ? { color: 'red' } : {};

      return (
        <tr key={'tr' + index} style={rowStyle}>
          <td style={rowStyle}>{obj.variants[0].sku}</td>
          <td style={rowStyle}>{truncatedTitle}</td>
          <td style={rowStyle}>{formatPrice(obj.variants[0].price)}</td>
          <td style={rowStyle}>{formatPriceCompare(obj.variants[0].compare_at_price)}</td>
          <td style={{ ...rowStyle, color: 'red' }}>{priceChange}</td>
          <td style={rowStyle}>{obj.variants[0].inventory_quantity}</td>
          <td style={{ ...rowStyle, color: 'red' }}>{inventoryChange}</td>
          <td style={rowStyle}>{obj.vendor}</td>
          <td style={{ ...rowStyle, color: 'red' }}>{vendorChange}</td>
          <td style={rowStyle}>{obj.tags}</td>
          <td style={{ ...rowStyle, color: 'red' }}>{tagChange}</td>
          {/*  <td style={rowStyle}>{obj.variants[0].taxable}</td>
          <td style={{ ...rowStyle, color: 'red' }}>{taxChange}</td> */}
          {/* <td style={rowStyle}>{obj.variants[0].weight}</td>
          <td style={{ ...rowStyle, color: 'red' }}>{weightChange}</td> */}
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
              <th>Precio Comparación</th>
              <th>Cambio de precio</th>
              <th>Inventario</th>
              <th>Cambio de inventario</th>
              <th>Marca</th>
              <th>Cambio de marca</th>
              <th>Etiquetas</th>
              <th>Cambio de etiquetas</th>
            </tr>
            {table_rows}
          </tbody>
        </table>
      </div>
    );

    if (!showAllProducts && paginationEnabled) {
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

  filterProducts(selectedOption) {
    const { productsHW, productsShopify } = this.state;

    switch (selectedOption) {
      case 'todos':
        return productsHW;
      case 'nuevos':
        return productsHW.filter((obj) => !this.hasMatchingShopifyProduct(obj.variants[0].sku)); // Mostrar solo los nuevos productos
      case 'actualizar':
        return productsHW.filter((obj) => this.hasPriceOrInventoryChange(obj.variants[0].sku)); // Mostrar solo los productos que requieren actualización
      default:
        return [];
    }
  }

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

  paginateProducts(products, currentPage, productsPerPage) {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return products.slice(startIndex, endIndex);
  }

  hasPriceOrInventoryChange(sku) {
    const { productsShopify, productsHW } = this.state;

    const matchingProductShopify = productsShopify.find(
      (product) => product.variants[0].sku === sku
    );

    if (matchingProductShopify) {
      return (
        matchingProductShopify.variants[0].price !== productsHW.variants[0].price ||
        matchingProductShopify.variants[0].inventory_quantity !==
        productsHW.variants[0].inventory_quantity
      );
    }

    return false;
  }

  hasMatchingShopifyProduct(sku) {
    const { productsShopify } = this.state;
    return productsShopify.some(
      (product) => product.variants[0].sku === sku
    );
  }

  renderPagination = () => {
    const { productsHW, productsPerPage, currentPage } = this.state;

    const pageNumbers = Math.ceil(productsHW.length / productsPerPage);

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

  loadData = () => {
    getElements('productsShopify', PRODUCTS_SHOPIFY, this.setProductsShopify);
    getElements('productsShopify2', PRODUCTS_SHOPIFY, this.setProductsShopify2);
    //getElements('productsHW', PRODUCTS_HW, this.setProductsHW);
    this.setState({ dataLoaded: true });
  };

  render() {
    const { dataLoaded, isLoading, selectedOption, updatedOn, hasErrors, is_processing, pending_update } = this.state;

    const currentDate = new Date();
    const updatedOnDate = new Date(updatedOn.replace(/(\d{4})\.(\d{2})\.(\d{2}) (\d{2}):(\d{2}):(\d{2})/, "$1-$2-$3T$4:$5:$6"));
    const isFechaSuperior = currentDate > updatedOnDate;
    const isValid = isFechaSuperior && !hasErrors && !pending_update && !is_processing;

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
        <span className='global-comp-title'>Productos</span>
        <div className='global-comp-description-container'>
          <span className='global-comp-description'>
            Aquí podrá visualizar todos los productos.
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
                    this.createProducts(),
                    this.modifyProducts(),
                    this.updateMissingProducts(),
                    this.getArchivedProductsFromHW(),
                    this.updateProductsPublished(),
                  ]);

                  // Luego, ejecutar this.saveDates().
                  this.saveDates();
                } else {
                  this.buildAlert('error', "No se puede sincronizar en el momento");
                  //console.log("No se cumplen las condiciones para sincronizar");
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

export default SyncProducts;