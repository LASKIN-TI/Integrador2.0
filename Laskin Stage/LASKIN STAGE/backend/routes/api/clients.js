const router = require('express').Router();
const ClientController = require('../../controllers/ClientsController');
const auth = require('../../middleware/auth');


router.get('/list',  auth.verifyAdmin,ClientController.list);
router.get('/detail',  auth.verifyAdmin, ClientController.detail);
module.exports = router;