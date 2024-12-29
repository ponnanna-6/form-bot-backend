const express = require('express');
const router = express.Router();
const { 
  createForm, 
  getForms, 
  updateForm, 
  deleteForm 
} = require('../controllers/formController');

router.post('/create', createForm);
router.get('/:folderId', getForms); // Get forms for a specific folder
router.put('/:id', updateForm); // Update form content
router.delete('/:id', deleteForm);

module.exports = router;
