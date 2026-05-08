const express = require('express');
const { upload } = require('../services/uploadService');
const requestController = require('../controllers/requestController');

const router = express.Router();

router.get('/', requestController.getRequests);
router.post('/', upload.single('file'), requestController.createRequest);
router.put('/:id', upload.single('file'), requestController.updateRequest);
router.delete('/:id', requestController.deleteRequest);

module.exports = router;