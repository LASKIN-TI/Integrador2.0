const router = require('express').Router();
const ParametersController = require('../../controllers/ParametersController');
const auth = require('../../middleware/auth');

router.get('/stock',   ParametersController.ParameterStock);
router.put('/updateStock',  ParametersController.updateStock);
router.get('/parametermessages', ParametersController.parameterMessages);
router.put('/updateparametermessages',  ParametersController.updateParameterMessages);
router.get('/googlecredentials',  ParametersController.credentialsGoogle);
router.put('/updatecredentials',  ParametersController.updateGoogleCredentials);
router.get('/sede', ParametersController.sedeDefecto);
router.put('/updatesede',  ParametersController.updateSede);
router.get('/activemessages',  ParametersController.activeMessage);
router.put('/updateactive', ParametersController.updateActive);
router.get('/activesync',  ParametersController.activeSync);
router.put('/updatesync', ParametersController.updateSync)


module.exports = router;