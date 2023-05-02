const T = require('tesseract.js')
const officegen = require('officegen')
const fs = require('fs')
const pptx = officegen('pptx')
const out = fs.createWriteStream('result.pptx')

T.recognize('./upload/fb70ed33e4be1e10038cd18946b55338.png', 'eng', {logger: e => console.log(e)})
    .then(result => {
        //Create a new slide
        const slide = pptx.makeNewSlide()
        slide.addText(result.data.text)

        // Generate the power point and save it to the file system
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