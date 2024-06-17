const router = require('express').Router();
const UsersRouter = require('./api/users');
const ProductsRouter = require('./api/products');
const LocationsRouter = require('./api/locations');
const OrdersRouter = require('./api/orders');
const DatesRouter = require('./api/dates');
const CityRouter = require('./api/cities');
const ParametersRouter = require('./api/parameters');
const InventoryRouter = require('./api/inventories');
const DispatchRouter = require('./api/dispatchs')

//USERS
router.use('/user', UsersRouter);

//PRODUCTS
router.use('/product', ProductsRouter)

//LOCATIONS
router.use('/location', LocationsRouter)

//ORDERS
router.use('/order', OrdersRouter)

//DATE
router.use('/date', DatesRouter)

//CITY
router.use('/city', CityRouter)

//INVENTORY
router.use('/inventory', InventoryRouter)

//PARAMETERS
router.use('/parameter', ParametersRouter)

//DISPATCH
router.use('/dispatch', DispatchRouter)



module.exports = router;