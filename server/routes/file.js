const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// File routes
router.post('/upload', auth, upload.single('file'), fileController.uploadFile);
router.get('/list', auth, fileController.listFiles);
router.get('/download/:fileId', auth, fileController.getDownloadUrl);
router.get('/download/file/:token', auth, fileController.downloadFile); // Note the updated path

module.exports = router;