const express = require('express'),
      router = express.Router();

// Require the controllers.
const mint_controller = require('../controllers/mint.controller');

router.post('/create', mint_controller.mint_create);
router.get('/', mint_controller.mint_all_details);
router.get('/:id', mint_controller.mint_details);
router.put('/:id/update', mint_controller.mint_update);
router.delete('/:id/delete', mint_controller.mint_delete);

module.exports = router;