const File = require('../models/File');
const crypto = require('crypto');
const path = require('path');
const { encrypt, decrypt } = require('../utils/encrypt');

const fileController = {
    uploadFile: async (req, res) => {
        try {
            if (req.user.role !== 'ops') {
                return res.status(403).json({ message: 'Only ops users can upload files' });
            }

            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const downloadToken = crypto.randomBytes(32).toString('hex');
            const file = new File({
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
                uploadedBy: req.user._id,
                downloadToken,
                downloadTokenExpiry: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
            });

            await file.save();
            res.status(201).json({ 
                message: 'File uploaded successfully', 
                fileId: file._id 
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    listFiles: async (req, res) => {
        try {
            const files = await File.find()
                .select('-downloadToken')
                .populate('uploadedBy', 'email');
            res.json(files);
        } catch (error) {
            console.error('List files error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    getDownloadUrl: async (req, res) => {
        try {
            if (req.user.role !== 'client') {
                return res.status(403).json({ message: 'Only client users can download files' });
            }

            const file = await File.findById(req.params.fileId);
            if (!file) {
                return res.status(404).json({ message: 'File not found' });
            }

            if (file.downloadTokenExpiry < Date.now()) {
                return res.status(400).json({ message: 'Download link expired' });
            }

            const downloadData = {
                fileToken: file.downloadToken,
                userId: req.user._id.toString(),
                timestamp: Date.now()
            };

            const encryptedUrl = encrypt(
                JSON.stringify(downloadData),
                process.env.URL_ENCRYPTION_KEY
            );

            const downloadUrl = `/api/files/download/${encryptedUrl}`;

            res.json({
                downloadUrl: downloadUrl,
                expiresIn: '24 hours'
            });
        } catch (error) {
            console.error('Get download URL error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    
    downloadFile: async (req, res) => {
        try {
        console.log('Download attempt:', {
            token: req.params.token,
            user: req.user?._id,
            role: req.user?.role
        });

        if (req.user.role !== 'client') {
            return res.status(403).json({ message: 'Only client users can download files' });
        }

        const decryptedData = decrypt(
            req.params.token,
            process.env.URL_ENCRYPTION_KEY
        );

        console.log('Decrypted data:', decryptedData);

        if (!decryptedData) {
            return res.status(400).json({ message: 'Invalid download URL' });
        }

        const data = JSON.parse(decryptedData);
        
        console.log('Parsed data:', data);
        
        if (data.userId !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized download attempt' });
        }

        const file = await File.findOne({ downloadToken: data.fileToken });
        if (!file || file.downloadTokenExpiry < Date.now()) {
            return res.status(404).json({ message: 'File not found or link expired' });
        }

        console.log('File found:', {
            filename: file.filename,
            originalName: file.originalName
        });

        const filePath = path.join(__dirname, '../uploads', file.filename);
        res.download(filePath, file.originalName);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    }
};

module.exports = fileController;