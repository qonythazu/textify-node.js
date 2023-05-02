const T = require('tesseract.js')
const officegen = require('officegen')
const fs = require('fs')
const docx = officegen('docx')
const out = fs.createWriteStream('result.docx')

T.recognize('./upload/fb70ed33e4be1e10038cd18946b55338.png', 'eng', {logger: e => console.log(e)})
    .then(result => {
        //Create a new paragraph
        const p = docx.createP()
        p.addText(result.data.text)

        // Generate the document and save it to the file system
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