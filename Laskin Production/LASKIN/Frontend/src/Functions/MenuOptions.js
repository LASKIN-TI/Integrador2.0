
export function setOptionsByRol(rol, collapse, changeSelected) {
  // STATIC LABELS
  const USERS = (
    <div key='s1' id='s1' className='m-menu-static-label'>
      <img className='m-icon' src='./person-gray.png' alt='person' />
      <span className='m-label'>Configuración</span>
      <img
        id='header-1'
        className='m-icon'
        src='./arrow-gray.png'
        alt='arrow'
        onClick={collapse}
        style={{ cursor: 'pointer' }}
      />
    </div>
  )

  const PRODUCTS = (
    <div key='s2' id='s2' className='m-menu-static-label'>
      <img className='m-icon' src='./products-gray.png' alt='product' />
      <span className='m-label'>Catálogo</span>
      <img
        id='header-2'
        className='m-icon'
        src='./arrow-gray.png'
        alt='arrow'
        onClick={collapse}
        style={{ cursor: 'pointer' }}
      />
    </div>
  )


  const ORDERS = (
    <div key='s4' id='s4' className='m-menu-static-label'>
      <img className='m-icon' src='./orders.png' alt='product' />
      <span className='m-label'>Pedidos</span>
      <img
        id='header-4'
        className='m-icon'
        src='./arrow-gray.png'
        alt='arrow'
        onClick={collapse}
        style={{ cursor: 'pointer' }}
      />
    </div>
  )

  const SYNC = (
    <div key='s6' id='s6' className='m-menu-static-label'>
      <img className='m-icon' src='./sync-gray.png' alt='product' />
      <span className='m-label'>Sincronización</span>
      <img
        id='header-6'
        className='m-icon'
        src='./arrow-gray.png'
        alt='arrow'
        onClick={collapse}
        style={{ cursor: 'pointer' }}
      />
    </div>
  )

  const PARAMETERS = (
    <div key='s7' id='s7' className='m-menu-static-label'>
      <img className='m-icon' src='./parameter.png' alt='product' />
      <span className='m-label'>Parametrización</span>
      <img
        id='header-7'
        className='m-icon'
        src='./arrow-gray.png'
        alt='arrow'
        onClick={collapse}
        style={{ cursor: 'pointer' }}
      />
    </div>
  )

  const DISPATCH = (
    <div key='s8' id='s8' className='m-menu-static-label'>
      <img className='m-icon' src='./parameter.png' alt='product' />
      <span className='m-label'>Envíos</span>
      <img
        id='header-8'
        className='m-icon'
        src='./arrow-gray.png'
        alt='arrow'
        onClick={collapse}
        style={{ cursor: 'pointer' }}
      />
    </div>
  )



  // GROUP LABELS
  // CONFIGURATION
  const LIST_USERS_LABEL = (
    <div key='l1' id={1} className='m-menu-label' onClick={changeSelected}>
      Listar usuarios
    </div>
  )

  const CREATE_USER_LABEL = (
    <div key='l2' id={2} className='m-menu-label' onClick={changeSelected}>
      Crear usuario
    </div>
  )

  //LOCATIONS
  const LIST_LOCATIONS_LABEL = (
    <div key='l5' id={5} className='m-menu-label' onClick={changeSelected}>
      Sedes
    </div>
  )

  const MODIFY_LOCATIONS_LABEL = (
    <div key='l23' id={23} className='m-menu-label' onClick={changeSelected}>
      Modificar sede
    </div>
  )

  const CREATE_LOCATIONS_LABEL = (
    <div key='l22' id={22} className='m-menu-label' onClick={changeSelected}>
      Crear sede
    </div>
  )

  //PARAMETERS
  const PARAMETERS_LABEL = (
    <div key='l17' id={17} className='m-menu-label' onClick={changeSelected}>
      Parámetros
    </div>
  )


  const MODIFY_USER_LABEL = (
    <div key='l12' id={12} className='m-menu-label' onClick={changeSelected}>
      Modificar usuario
    </div>
  )


  //PRODUCTS
  const LIST_PRODUCTS_LABEL = (
    <div key='l3' id={3} className='m-menu-label' onClick={changeSelected}>
      Productos
    </div>
  )
  const MODIFY_PRODUCTS_LABEL = (
    <div key='l6' id={6} className='m-menu-label' onClick={changeSelected}>
      Modificar productos
    </div>
  )

  const CREATE_PRODUCTS_LABEL = (
    <div key='l7' id={7} className='m-menu-label' onClick={changeSelected}>
      Crear Producto
    </div>
  )


  //PROCEDURES
  const LIST_PROCEDURES_LABEL = (
    <div key='l4' id={4} className='m-menu-label' onClick={changeSelected}>
      Procedimientos
    </div>
  )

  const CREATE_PROCEDURES_LABEL = (
    <div key='l9' id={9} className='m-menu-label' onClick={changeSelected}>
      Crear procedimiento
    </div>
  )

  //ORDERS
  const LIST_ORDERS_LABEL = (
    <div key='l10' id={10} className='m-menu-label' onClick={changeSelected}>
      Listar
    </div>
  )

  const MODIFY_ORDERS_LABEL = (
    <div key='l15' id={15} className='m-menu-label' onClick={changeSelected}>
      Modificar
    </div>
  )

  const RECORDS_ORDERS_LABEL = (
    <div key='l16' id={16} className='m-menu-label' onClick={changeSelected}>
      Consola de registros
    </div>
  )

  const CREATE_ORDER_LABEL = (
    <div key='l21' id={21} className='m-menu-label' onClick={changeSelected}>
      Crear
    </div>
  )


  //SYNC
  const SYNC_PRODUCTS_LABEL = (
    <div key='l11' id={11} className='m-menu-label' onClick={changeSelected}>
      Catálogo de productos
    </div>
  )

  const SYNC_PROCEDURES_LABEL = (
    <div key='l13' id={13} className='m-menu-label' onClick={changeSelected}>
      Catálogo de procedimientos
    </div>
  )

  const RECORDS_LABEL = (
    <div key='l14' id={14} className='m-menu-label' onClick={changeSelected}>
      Consola de registros
    </div>
  )

  const STATE_LABEL = (
    <div key='l18' id={18} className='m-menu-label' onClick={changeSelected}>
      Resumen
    </div>
  )

  //DISPATCHS
  const LIST_DISPATCH_LABEL = (
    <div key='l19' id={19} className='m-menu-label' onClick={changeSelected}>
      Parametrizaciones
    </div>
  )

  const CREATE_DISPATCH_LABEL = (
    <div key='l20' id={20} className='m-menu-label' onClick={changeSelected}>
      Crear parametrización
    </div>
  )

  const MODIFY_DISPATCH_LABEL = (
    <div key='l24' id={24} className='m-menu-label' onClick={changeSelected}>
      Modificar parametrización
    </div>
  )



  // GROUPS
  // USERS
  const USERS_GROUP = (
    <div
      key='g1'
      id='group-1'
      className='m-menu-group'
      style={{ display: 'none' }}
    >
      {LIST_USERS_LABEL}
      {CREATE_USER_LABEL}
      {MODIFY_USER_LABEL}
      {PARAMETERS_LABEL}
    </div>
  )

  //Products
  const PRODUCTS_GROUP = (
    <div
      key='g2'
      id='group-2'
      className='m-menu-group'
      style={{ display: 'none' }}
    >
      {LIST_PRODUCTS_LABEL}
      {LIST_PROCEDURES_LABEL}
    </div>
  )


  //Orders
  const ORDERS_GROUP = (
    <div
      key='g4'
      id='group-4'
      className='m-menu-group'
      style={{ display: 'none' }}
    >
      {LIST_ORDERS_LABEL}
      {MODIFY_ORDERS_LABEL}
      {RECORDS_ORDERS_LABEL}
    </div>
  )

  //Sync
  const SYNC_GROUP = (
    <div
      key='g6'
      id='group-6'
      className='m-menu-group'
      style={{ display: 'none' }}
    >
      {STATE_LABEL}
      {SYNC_PRODUCTS_LABEL}
      {SYNC_PROCEDURES_LABEL}
      {RECORDS_LABEL}
    </div>
  )

  const PARAMETERS_GROUP = (
    <div
      key='g7'
      id='group-7'
      className='m-menu-group'
      style={{ display: 'none' }}
    >
      {PARAMETERS_LABEL}
    </div>
  )

  const DISPATCH_GROUP = (
    <div
      key='g8'
      id='group-8'
      className='m-menu-group'
      style={{ display: 'none' }}
    >
      {LIST_LOCATIONS_LABEL}
      {CREATE_LOCATIONS_LABEL}
      {MODIFY_LOCATIONS_LABEL}
      {LIST_DISPATCH_LABEL}
      {CREATE_DISPATCH_LABEL}
      {MODIFY_DISPATCH_LABEL}
    </div>
  )


  let array = []

  switch (rol) {
    case 'administrador':
      array.push(PRODUCTS)
      array.push(PRODUCTS_GROUP)
      array.push(ORDERS)
      array.push(ORDERS_GROUP)
      array.push(DISPATCH)
      array.push(DISPATCH_GROUP)
      array.push(SYNC)
      array.push(SYNC_GROUP)
      array.push(USERS)
      array.push(USERS_GROUP)

      return array

    case 'usuario':
      array.push(ORDERS)
      array.push(ORDERS_GROUP)

      return array

    default:
      return array
  }
}
