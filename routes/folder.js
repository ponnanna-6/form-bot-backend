const express = require('express');
const router = express.Router();
const { 
  createFolder, 
  getFolders, 
  deleteFolder 
} = require('../controllers/folderController');

router.post('/create', createFolder);
router.get('/:workspaceId', getFolders); // Get folders for a specific workspace
router.delete('/:id', deleteFolder);

module.exports = router;
