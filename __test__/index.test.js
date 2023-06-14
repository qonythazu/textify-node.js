const request = require('supertest');
const app = require('./../index.js');
const fs = require('fs');

let server;

beforeAll(() => {
  server = app.listen(3001); // Change the port as needed
});

afterAll((done) => {
  server.close(() => {
    done(); // Add this line to ensure the Jest process exits
  });
});

jest.setTimeout(10000); // Set the timeout for the entire test suite

describe('POST /upload', () => {
  afterEach(() => {
    if (fs.existsSync('./docxresult/result.docx')) {
      fs.unlinkSync('./docxresult/result.docx');
    }
    if (fs.existsSync('./pptxresult/result.pptx')) {
      fs.unlinkSync('./pptxresult/result.pptx');
    }
  });

  it('should return 400 if no file uploaded', async () => {
    const response = await request(app).post('/upload');
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('No file uploaded');
  });

  it('should return 500 if image is not png format', async () => {
    const response = await request(app)
      .post('/upload')
      .attach('image', `${__dirname}/test.jpg`)
      .query({ fileType: 'docx' });
    expect(response.statusCode).toBe(500);
    expect(response.text).toBe('Internal Server Error');
  });

  it('should return 400 if invalid file type', async () => {
    const response = await request(app)
      .post('/upload')
      .attach('image', `${__dirname}/test.png`)
      .query({ fileType: 'invalid' });
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('Invalid file type');
  });

  it('should return 200 and download docx file', async () => {
    const response = await request(app)
      .post('/upload')
      .attach('image', `${__dirname}/test.png`)
      .query({ fileType: 'docx' });
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-disposition']).toContain('result.docx');
  });

  it('should return 200 and download pptx file', async () => {
    const response = await request(app)
      .post('/upload')
      .attach('image', `${__dirname}/test.png`)
      .query({ fileType: 'pptx' });
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-disposition']).toContain('result.pptx');
  });
});