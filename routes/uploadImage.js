const express = require("express")
const router = express.Router()
const formidable = require('formidable');
const fs = require('fs')

router.post("/upload", async (req, res) => {
    try {
        // ini cara mendapatkan file, gatau gimana cara kerjanya, aku tau lewat stackoverflow
        // menurut percobaanku, ini mengatasi parameter multipart
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            var tipefoto = files['photo_barang'][0]['mimetype'].match(/(?<=\/)\w+/g)[0]
            var id_barang = fields['id_barang'][0];
            // ada local variable 'files', artinya beberapa file yang diterima, formatnya adalah json -> {"<nama_parameter>":[...]}
            // console.log('files: ', files);
            // kira" outputnya gini -> 
            /*files:  {
                photo_barang: [
                    PersistentFile {
                    _events: [Object: null prototype],
                    _eventsCount: 1,
                    _maxListeners: undefined,
                    lastModifiedDate: 2023-12-14T13:02:25.485Z,
                    filepath: 'C:\\Users\\Rama\\AppData\\Local\\Temp\\15f6ef21977a8b7ccbcd0e800',
                    newFilename: '15f6ef21977a8b7ccbcd0e800',
                    originalFilename: '6.jpg',
                    mimetype: 'image/jpeg',
                    hashAlgorithm: false,
                    size: 706956,
                    _writeStream: [WriteStream],
                    hash: null,
                    [Symbol(kCapture)]: false
                    }
                ]
                }*/

            // ada juga local var 'fields', artinya beberapa parameter yang bukan file, formatnya adalah json -> {"<nama_parameter>":[...]}
            console.log('fields: ', fields);
            // kira" outputnya gini -> fields:  { id_barang: [ '343dsfdf' ], nama_barang: [ 'sdadasdad2342442' ] }

            // old path ini adalah lokasi file yang sudah diterima, file ini biasanya ditaruh di temporary folder atau cache
            let oldPath = files['photo_barang'][0].filepath;
            // newpath adalah lokasi dimana pengen menyimpan filenya (<folder>/<nama>.<tipefile>)
            let newPath = `../assets/photo_barang/${id_barang}.${tipefoto}`
            // membaca file yang sudah diterima di folder temporary,
            // ini membaca sebagai rawData/Buffer supaya bisa ditulis ulang
            let rawData = fs.readFileSync(oldPath)
            
            //simpan gambar di folder 'newPath'
            fs.writeFile(newPath, rawData, function (err) {
                if (err) console.log(err)
            })

            console.log(tipefoto);
            res.send({ success: true });
        });
    } catch (error) {
        console.log("UPLOADIMAGE/UPLOAD ERR:" + error);
    }

})

module.exports = router