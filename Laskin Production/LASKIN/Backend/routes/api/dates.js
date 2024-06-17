const router = require('express').Router();
const DateController = require('../../controllers/DateController');
const auth = require('../../middleware/auth');

router.get('/datehw',   DateController.datehw);
router.post('/createDate',   DateController.createDate);
router.get('/dateProduct',  DateController.listLastProductDate);
router.get('/dateProcedure',  DateController.listLastProcedureDate);
router.post('/createActivate', DateController.createStockDate);
router.get('/activation',  DateController.listLastActivationDate);
router.get('/desactivation',  DateController.listLastDesactivationDate);
router.get('/automaticproduct',  DateController.automaticDateProduct);
router.get('/automaticprocedure',  DateController.automaticDateProcedure);


module.exports = router;