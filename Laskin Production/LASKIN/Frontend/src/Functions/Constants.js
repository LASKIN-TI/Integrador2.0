const { REACT_APP_NODE_ENV } = process.env

export const ROL_TYPES = [
  { name: 'Administrador', value: 'administrador' },
  { name: 'Usuario', value: 'usuario' }
]

export const COUNTRY = [
  {name: 'COLOMBIA', value: 'COLOMBIA'},
  {name: 'ECUADOR', value: 'ECUADOR'},
  {name: 'REINO UNIDO', value: 'REINO UNIDO'},
  {name: 'ESTADOS UNIDOS', value: 'ESTADOS UNIDOS'}
]

export const PRODUCT_TYPES = [
  { name: 'Nuevos', value: 'nuevos' },
  { name: 'Actualizar', value: 'actualizar' }
]

export const STATUS = [
  {name: 'Activo', value: 'active'},
  {name: 'Archivado', value: 'archived'},
  {name: 'Borrador', value: 'draft'}
]

// SERVICES
export const HOST = 
  REACT_APP_NODE_ENV === 'production' ? 
    process.env.REACT_APP_HOST_PROD :
    REACT_APP_NODE_ENV === 'qa' ? 
      process.env.REACT_APP_HOST_QA :
        process.env.REACT_APP_HOST_DEV
export const IMAGE_HOST = 
  REACT_APP_NODE_ENV === 'production' ? 
    process.env.REACT_APP_IMAGE_HOST_PROD :
    REACT_APP_NODE_ENV === 'qa' ? 
      process.env.REACT_APP_IMAGE_HOST_QA :
        process.env.REACT_APP_IMAGE_HOST_DEV

//USERS
export const LOGIN = 'user/login'
export const LIST_USERS = 'user/list'
export const USERS_BY_ID = 'user/detail'
export const CREATE_USER = 'user/create'
export const MODIFY_USER = 'user/update'
export const DELETE_USER = 'user/delete'

//PRODUCTS - PROCEDURES
export const PRODUCTS_SHOPIFY = 'product/products'
export const CREATE_PRODUCTS = 'product/createMYSQL'
export const MODIFY_PRODUCTS = 'product/update/'
export const DETAIL_PRODUCTS = 'product/detail/'
export const UPDATE_POLICY = 'product/policy'
export const UPDATE_PRODUCTS = 'product/updateMysql'
export const PROCEDURES_SHOPIFY = 'product/procedures'
export const LIST_PROCEDURES = 'product/procedureslist'
export const LIST_RECORDS = 'product/records'
export const RECORDS_EXCEL = 'product/excel'

//SYNC
export const SYNC_PRODUCTS = 'product/syncproducts'
export const SYNC_PROCEDURES = 'product/syncProcedures'

//PRODUCTS HW
export const PRODUCTS_HW = 'product/productsHW'
export const PROCEDURES_HW = 'product/proceduresHW'

//PROCEDURES
export const CREATE_PROCEDURES = 'procedure/createMYSQL'
export const MODIFY_PROCEDURES = 'product/update/'
export const UPDATE_PROCEDURES = 'procedure/updateMysql'

//LOCATIONS
export const LIST_LOCATIONS = 'location/list'
export const CREATE_LOCATIONS = 'location/create'
export const MODIFY_LOCATION = 'location/modify'
export const DETAIL_LOCATION = 'location/detail'
export const UPDATE_LOCATION = 'location/update'
export const SAVE_LOCATIONS = 'location/savelocations'


//ORDERS
export const LIST_ORDERS = 'order/list'
export const SEND_ORDER = 'order/send'
export const UPDATE_ORDER = 'order/update'
export const ORDER_DETAIL = 'order/detail'
export const MODIFY_ORDER = 'order/modify'
export const LIST_ORDERS_PAGE = 'order/orders'
export const ORDERS_RECORDS = 'order/records'
export const ORDERS_EXCEL = 'order/excel'
export const SEND_HOOK = 'order/sendhook'

//DATES
export const DATE_HW = 'date/datehw'
export const CREATE_DATE = 'date/createDate'
export const DATE_PRODUCTS = 'date/dateProduct'
export const DATE_PROCEDURES = 'date/dateProcedure'
export const DATE_ACTIVATION = 'date/activation'
export const DATE_DESACTIVATION = 'date/desactivation'
export const DATE_STOCK = 'date/createActivate'
export const DATE_AUTOMATIC_PRODUCT = 'date/automaticproduct'
export const DATE_AUTOMATIC_PROCEDURE = 'date/automaticprocedure'

//OTHERS
export const CITIES = 'city/cities'
export const DEPARTMENTS = 'city/departments'
export const STATES = 'product/state'
export const UPDATE_STATE = 'product/updatestock'
export const CITIES_DEPARTMENTS = 'city/listcity'

//PARAMETERS
export const STOCK = 'parameter/stock'
export const UPDATE_STOCK = 'parameter/updateStock'
export const MESSAGES = 'parameter/parametermessages'
export const UPDATE_MESSAGE = 'parameter/updateparametermessages'
export const GOOGLE = 'parameter/googlecredentials'
export const UPDATE_GOOGLE = 'parameter/updatecredentials'
export const SEDE_DEFAULT = 'parameter/sede'
export const UPDATE_SEDE = 'parameter/updatesede'
export const ACTIVE_MESSAGES = 'parameter/activemessages'
export const UPDATE_ACTIVE = 'parameter/updateactive'
export const ACTIVE_HOOKS = 'parameter/activesync'
export const UPDATE_SYNC = 'parameter/updatesync'


//CLIENTS
export const CLIENTS_DETAIL = 'client/detail'
export const LIST_CLIENTS = 'client/list'

//DISPATCH
export const CREATE_DISPATCH = 'dispatch/create'
export const LIST_DISPATCH = 'dispatch/list'
export const DELETE_DISPATCH = 'dispatch/delete'
export const DETAIL_DISPATCH = 'dispatch/detail'
export const UPDATE_DISPATCH = 'dispatch/update'




export const RECOVER_PASSWORD = 'user/recover_pass'
export const TOKEN_VERIFICATION = 'user/token_verification'
export const PASSWORD_CHANGE = 'user/password_change'

// ALERTS
export const MANDATORY_MESSAGE =
  'Verifique que ha llenado todos los campos obligatorios.'
export const ERROR_MESSAGE =
  'Ha ocurrido un error. Por favor intente más tarde.'
export const EMAIL_MESSAGE =
  'El formato del correo electrónico no es válido. Por favor verifique.'
export const NO_ITEM_MESSAGE =
  'No hay registros disponibles para esta selección.'
export const INVALID_STRING_MESSAGE =
  'Alguno de los campos ingresados supera la extensión permitida o se detectó un patrón inválido. Por favor revise los campos.'
export const ALERT_TIMEOUT = 9000
export const CONFIRM_SEND_ORDER = "Se enviará la órden hacia HistoWeb."
export const CONFIRM_ACTIVATE_INVENTORY = "Se activará la venta sin Stock"
export const CONFIRM_DESACTIVATE_INVENTORY = "Se descativará la venta sin Stock"
export const CONFIRM_DELETE_DISPATCH = "Se eliminará permanentemente la parametrización"

// ERRORS
export const NO_ITEMS_ERROR = 'No hay registros en el sistema.'
export const INVALID_LOGIN_ERROR = 'Error en el usuario o contraseña.'
export const INACTIVE_LOGIN_ERROR = 'Error el usuario se encuentra inactivo.'
export const USED_EMAIL_ERROR = 'El correo electrónico ya se encuentra en uso.'
export const NO_EMAIL_ERROR ='El correo electrónico no se encuentra registrado.'

// OTHERS
export const DAY_IN_MS = 1000 * 60 * 60 * 24
export const DATE_OPTIONS = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
}
