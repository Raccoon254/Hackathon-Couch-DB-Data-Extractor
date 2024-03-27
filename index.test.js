const request = require('supertest');
const app = require('./index'); // Import your app

let server;

beforeAll(done => {
    server = app.listen(3000, done);
});

afterAll(done => {
    server.close(done);
});

describe('Test the /api/medic endpoint', () => {
    test('It should respond with status code 200', async () => {
        const response = await request(server).get('/api/medic');
        expect(response.statusCode).toBe(200);
    });

    test('It should respond with an array', async () => {
        const response = await request(server).get('/api/medic');
        expect(Array.isArray(response.body)).toBe(true);
    });
});
