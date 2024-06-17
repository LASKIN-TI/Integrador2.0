const router = require('express').Router();
const OrdersController = require('../../controllers/OrdersController');
const auth = require('../../middleware/auth');

router.get('/list',  OrdersController.list);
router.get('/orders',  OrdersController.orders);
router.get('/records',  OrdersController.ordersRecords);
router.get('/excel',  OrdersController.downloadExcel);
router.get('/detail',  OrdersController.detail);
router.put('/modify',  OrdersController.modify);
router.post('/sendhook',  OrdersController.sendHook);


module.exports = router;