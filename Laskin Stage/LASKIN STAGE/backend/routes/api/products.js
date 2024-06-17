const router = require('express').Router();
const ProductsController = require('../../controllers/ProductsController');
const auth = require('../../middleware/auth');

router.get('/productsHW',  ProductsController.productsHW);
router.get('/proceduresHW',  ProductsController.proceduresHW);
router.get('/products', ProductsController.products);
router.get('/procedures', ProductsController.procedures);
router.get('/procedureslist',  ProductsController.proceduresList);
router.post('/create',   ProductsController.create);
router.post('/update',  ProductsController.update)
router.get('/records', ProductsController.records);
router.get('/state',  ProductsController.states);
router.put('/updatestock',  ProductsController.updateStock);
router.get('/excel',  ProductsController.downloadExcel);

router.get('/listShopify', ProductsController.listShopify);

module.exports = router;
