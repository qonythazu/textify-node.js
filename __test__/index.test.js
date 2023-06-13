const request = require('supertest');
const app = require('./../index.js');
const fs = require('fs');

let server;

beforeAll(async () => {
  server = await app.listen(3000); // Ubah port sesuai kebutuhan Anda
});

afterAll(async () => {
  await server.close();
});

describe('POST /upload', () => {
  afterEach(() => {
    fs.unlinkSync('./docxresult/result.docx');
    fs.unlinkSync('./pptxresult/result.pptx');
  });

  it('should return 400 if no file uploaded', async () => {
    const response = await request(app).post('/upload');
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('No file uploaded');
  });

  it('should return 400 if invalid file type', async () => {
    const response = await request(app)
      .post('/upload')
      .attach('image', 'test.jpg')
      .query({ fileType: 'invalid' });
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('Invalid file type');
  });

  it('should return 500 if error uploading file', async () => {
    const response = await request(app)
      .post('/upload')
      .attach('image', 'test.png')
      .query({ fileType: 'docx' });
    expect(response.statusCode).toBe(500);
    expect(response.text).toBe('Internal Server Error');
  });

  it('should return 200 and download docx file', async () => {
    const response = await request(app)
      .post('/upload')
      .attach('image', 'test.png')
      .query({ fileType: 'docx' });
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-disposition']).toContain('result.docx');
  });

  it('should return 200 and download pptx file', async () => {
    const response = await request(app)
      .post('/upload')
      .attach('image', 'test.png')
      .query({ fileType: 'pptx' });
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-disposition']).toContain('result.pptx');
  });
});
