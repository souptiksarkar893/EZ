const request = require('supertest');
const app = require('../server');
const File = require('../models/File');
const User = require('../models/User');
const mongoose = require('mongoose');
const path = require('path');

let opsToken, clientToken;

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST);
    
    // Create test users
    const opsUser = await User.create({
        email: 'ops@test.com',
        password: 'password123',
        role: 'ops',
        isVerified: true
    });

    const clientUser = await User.create({
        email: 'client@test.com',
        password: 'password123',
        role: 'client',
        isVerified: true
    });

    opsToken = generateToken(opsUser);
    clientToken = generateToken(clientUser);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe('File Operations Tests', () => {
    beforeEach(async () => {
        await File.deleteMany({});
    });

    describe('POST /api/files/upload', () => {
        it('should allow ops users to upload files', async () => {
            const res = await request(app)
                .post('/api/files/upload')
                .set('Authorization', `Bearer ${opsToken}`)
                .attach('file', path.join(__dirname, 'test-files/test.docx'));

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('fileId');
        });

        it('should not allow client users to upload files', async () => {
            const res = await request(app)
                .post('/api/files/upload')
                .set('Authorization', `Bearer ${clientToken}`)
                .attach('file', path.join(__dirname, 'test-files/test.docx'));

            expect(res.statusCode).toBe(403);
        });
    });

    describe('GET /api/files/list', () => {
        it('should list files for client users', async () => {
            const res = await request(app)
                .get('/api/files/list')
                .set('Authorization', `Bearer ${clientToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
        });
    });
});