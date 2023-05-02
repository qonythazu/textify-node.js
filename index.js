const express = require('express');
const multer = require('multer');
const app = express();
// const upload = multer({ dest: './upload/' });
const path = require('path');

// mengatur direktori untuk menyimpan gambar yang diunggah
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.resolve(''), 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + '-' + Date.now() + '.png')
  }
});

// membatasi jenis file yang dapat diunggah
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(png)$/)) {
      return cb(new Error('Only .png files are allowed!'));
    }
    cb(null, true);
  }
})

// menangani permintaan POST untuk mengunggah gambar
app.post('/upload', upload.single('image'), function(req, res) {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  // menentukan jenis file yang diminta oleh aplikasi Flutter
  const fileType = req.body.fileType;

  // memeriksa jenis file yang diminta
  if (fileType === 'docx') {
    // kode untuk mengubah gambar ke docx
    const docx = officegen('docx')
    const out = fs.createWriteStream('result.docx')
    T.recognize(req.file.path, 'eng', {logger: e => console.log(e)})
      .then(result => {
        const p = docx.createP()
        p.addText(result.data.text)
        out.on('finish', () => {
          console.log('File berhasil disimpan')
        }).on('error', (err) => {
          console.log('Terjadi kesalahan:', err)
        })
        docx.generate(out)
      })
      .catch(err => {
        console.error(err)
      })
  } else if (fileType === 'pptx') {
    // kode untuk mengubah gambar ke pptx
    const pptx = officegen('pptx')
    const out = fs.createWriteStream('result.pptx')
    T.recognize(req.file.path, 'eng', {logger: e => console.log(e)})
      .then(result => {
        const slide = pptx.makeNewSlide()
        slide.addText(result.data.text)
        out.on('finish', () => {
          console.log('File berhasil disimpan')
        }).on('error', (err) => {
          console.log('Terjadi kesalahan:', err)
        })
        pptx.generate(out)
      })
      .catch(err => {
        console.error(err)
      })
  } else {
    // tampilkan pesan kesalahan jika jenis file tidak valid
    res.status(400).send('Invalid file type')
  }

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