const router = require('express').Router();
const CityController = require('../../controllers/CityController');
const auth = require('../../middleware/auth');

router.get('/list',  CityController.city);
router.get('/city',  CityController.citylist);
router.get('/cities',  CityController.cities);
router.get('/departments',  CityController.departments);
router.get('/listcity', CityController.list);


module.exports = router;