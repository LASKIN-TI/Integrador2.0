const router = require('express').Router();
const DispatchController = require('../../controllers/DispatchController');
const auth = require('../../middleware/auth');


router.post('/create', DispatchController.create);
router.get('/list',   DispatchController.list);
router.get('/detail',   DispatchController.detail);
router.delete('/delete',  DispatchController.delete);
router.put('/update', DispatchController.update);

module.exports = router;