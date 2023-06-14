const T = require('tesseract.js');
const express = require('express');
const multer = require('multer');
const app = express();
const path = require('path');
const fs = require('fs');
const officegen = require('officegen');

// Mengatur direktori untuk menyimpan gambar yang diunggah
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.resolve(''), 'upload'));
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.png');
  }
});

// Membatasi jenis file yang dapat diunggah
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(png)$/)) {
      return cb(new Error('Only .png files are allowed!'));
    }
    cb(null, true);
  }
});

const isTestEnvironment = process.env.NODE_ENV === 'test'; // Menentukan apakah dalam lingkungan pengujian atau tidak

const sendConvertedFile = (res, fileType) => {
  let file;
  if (fileType === 'docx') {
    file = isTestEnvironment
      ? path.join(__dirname, '__test__', 'docxresult', 'result.docx')
      : path.join(__dirname, 'docxresult', 'result.docx');
  } else if (fileType === 'pptx') {
    file = isTestEnvironment
      ? path.join(__dirname, '__test__', 'pptxresult', 'result.pptx')
      : path.join(__dirname, 'pptxresult', 'result.pptx');
  } else {
    return res.status(400).send('Invalid file type');
  }

  return res.download(file, `result.${fileType}`, (err) => {
    if (err) {
      console.error('Terjadi kesalahan saat mengirim file:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('File berhasil dikirim');
    }
  });
};

// Menangani permintaan POST untuk mengunggah gambar
app.post('/upload', upload.single('image'), function (req, res) {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  // Menentukan jenis file yang diminta oleh aplikasi Flutter
  const fileType = req.query.fileType;

  // Memeriksa jenis file yang diminta
  if (fileType === 'docx') {
    // Kode untuk mengubah gambar ke docx
    const docx = officegen('docx');
    const out = fs.createWriteStream(
      isTestEnvironment
        ? path.join(__dirname, '__test__', 'docxresult', 'result.docx')
        : path.join(__dirname, 'docxresult', 'result.docx')
    );
    T.recognize(req.file.path, 'eng')
      .then(result => {
        const p = docx.createP();
        p.addText(result.data.text);
        out.on('finish', () => {
          console.log('File berhasil disimpan');
          sendConvertedFile(res, 'docx'); // Mengirim hasil konversi docx ke Flutter
        }).on('error', (err) => {
          console.log('Terjadi kesalahan:', err);
        });
        docx.generate(out, () => {
          console.log('File berhasil disimpan 2');
        });
      })
      .catch(err => {
        console.error(err);
      });
    return;
  } else if (fileType === 'pptx') {
    // Kode untuk mengubah gambar ke pptx
    const pptx = officegen('pptx');
    const out = fs.createWriteStream(
      isTestEnvironment
        ? path.join(__dirname, '__test__', 'pptxresult', 'result.pptx')
        : path.join(__dirname, 'pptxresult', 'result.pptx')
    );
    T.recognize(req.file.path, 'eng')
      .then(result => {
        const slide = pptx.makeNewSlide();
        slide.addText(result.data.text);
        out.on('finish', () => {
          console.log('File berhasil disimpan');
          sendConvertedFile(res, 'pptx'); // Mengirim hasil konversi pptx ke Flutter
        }).on('error', (err) => {
          console.log('Terjadi kesalahan:', err);
        });
        pptx.generate(out, () => {
          console.log('File berhasil disimpan');
        });
      })
      .catch(err => {
        console.error(err);
      });
    return;
  } else {
    // Tampilkan pesan kesalahan jika jenis file tidak valid
    return res.status(400).send('Invalid file type');
  }
});

// Menangani kesalahan pada middleware multer
app.use(function (err, req, res, next) {
  if (err instanceof multer.MulterError) {
    // Kesalahan terjadi saat mengunggah gambar
    console.log(err);
    return res.status(400).send('Error uploading file');
  } else {
    next(err);
  }
});

// Menangani kesalahan lainnya
app.use(function (err, req, res, next) {
  console.log(err);
  return res.status(500).send('Internal Server Error');
});

app.listen(3000, function () {
  console.log('Server started on port 3000');
});

module.exports = app;