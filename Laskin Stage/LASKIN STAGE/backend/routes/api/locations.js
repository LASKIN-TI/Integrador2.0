const router = require('express').Router();
const LocationsController = require('../../controllers/LocationsController');
const auth = require('../../middleware/auth');

router.get('/list',   LocationsController.list);
router.post('/create',  LocationsController.create);
router.put('/modify/:id', LocationsController.modify);
router.get('/detail',  LocationsController.detail);
router.put('/update',   LocationsController.update);
router.get('/savelocations', LocationsController.saveLocations);


module.exports = router;