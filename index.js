const T = require('tesseract.js')
const express = require('express');
const multer = require('multer');
const app = express();
const path = require('path');
const fs = require('fs');
const officegen = require('officegen');

// mengatur direktori untuk menyimpan gambar yang diunggah
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.resolve(''), 'upload'));
  },
  filename: function (req, file, cb) {  
    cb(null, file.fieldname + '-' + Date.now() + '.png')
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

//Mengirim konversi sebagai respon
const sendConvertedFile = (res, filePath, fileType) => {
  // fs.readFile(filePath, (err, data) => {
  //   if (err) {
  //     console.error('Terjadi kesalahan saat membaca file:', err);
  //     return res.status(500).send('Terjadi kesalahan saat membaca file');
  //   }
  //   res.setHeader('Content-Type', 'application/octet-stream');
  //   if (fileType === 'docx') {
  //     res.setHeader('Content-Disposition', 'attachment; filename=result.docx');
  //   } else if (fileType === 'pptx') {
  //     res.setHeader('Content-Disposition', 'attachment; filename=result.pptx');
  //   }
    res.download(filePath);
  // });
};

// app.use('/static', express.static(path.join(__dirname, 'assets')));

// menangani permintaan POST untuk mengunggah gambar
app.post('/upload', upload.single('image'), function(req, res) {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  // menentukan jenis file yang diminta oleh aplikasi Flutter
  const fileType = req.query.fileType;

  // memeriksa jenis file yang diminta
  if (fileType === 'docx') {
    // kode untuk mengubah gambar ke docx
    const docx = officegen('docx')
    const out = fs.createWriteStream('result.docx')
    console.log(req.file.path);
    T.recognize(req.file.path, 'eng', {logger: e => console.log(e)})
      .then(result => {
        const p = docx.createP()
        p.addText(result.data.text)
        out.on('finish', () => {
          console.log("tes1");
          console.log('File berhasil disimpan')

          docx.generate(out, () => {
            console.log('File berhasil disimpan');
            console.log("tes2");
            // sendConvertedFile(res, 'result.docx', 'docx'); // Mengirim hasil konversi docx ke Flutter
            res.download(`D:/Pdf Converter/result.docx`)
          });
        }).on('error', (err) => {
          console.log('Terjadi kesalahan:', err)
        })
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
        pptx.generate(out, () => {
          console.log('File berhasil disimpan');
          // sendConvertedFile(res, 'result.pptx', 'pptx'); // Mengirim hasil konversi pptx ke Flutter
        });
      })
      .catch(err => {
        console.error(err)
      })
  } else {
    // tampilkan pesan kesalahan jika jenis file tidak valid
    return res.status(400).send('Invalid file type')
  }

  console.log(req.file);
  // return res.send('File uploaded successfully');
  res.download(`D:/Pdf Converter/result.pptx`);
});

// menangani kesalahan pada middleware multer
app.use(function(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    // kesalahan terjadi saat mengunggah gambar
    console.log(err);
    return res.status(400).send('Error uploading file');
  } else {
    next(err);
  }
});

// menangani kesalahan lainnya
app.use(function(err, req, res, next) {
  console.log(err);
  return res.status(500).send('Internal Server Error');
});

app.listen(3000, function () {
  console.log('Server started on port 3000');
});