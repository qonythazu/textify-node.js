const express = require('express');
const multer = require('multer');
const app = express();
const upload = multer({ dest: './upload/' });
const path = require('path');

// mengatur direktori untuk menyimpan gambar yang diunggah
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.resolve(''), 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// membatasi jenis file yang dapat diunggah
const fileFilter = function (req, file, cb) {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed'));
  }
}

// menangani permintaan POST untuk mengunggah gambar
app.post('/upload', upload.single('image'), function(req, res) {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  // lakukan sesuatu dengan gambar yang diunggah
  console.log(req.file);
  res.send('File uploaded successfully');
});

// menangani kesalahan pada middleware multer
app.use(function(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    // kesalahan terjadi saat mengunggah gambar
    console.log(err);
    res.status(400).send('Error uploading file');
  } else {
    next(err);
  }
});

// menangani kesalahan lainnya
app.use(function(err, req, res, next) {
  console.log(err);
  res.status(500).send('Internal Server Error');
});

app.listen(3000, function () {
  console.log('Server started on port 3000');
});