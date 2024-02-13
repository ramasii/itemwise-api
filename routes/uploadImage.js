const express = require("express");
const path = require("path");
const tesjwt = require("../tesjwt");
const router = express.Router()
const formidable = require('formidable');
const fs = require('fs')
const dirphoto = "./assets/photo_barang/"

// ini dari bawaanya writefile uda otomatis replace, jadi anggap aja endpoint ini jadi satu sama update
router.post("/", tesjwt.verifyToken, async (req, res) => {
    console.log("FOTO BARANG: START POST");
    try {
        // ini cara mendapatkan file, gatau gimana cara kerjanya, aku tau lewat stackoverflow
        // menurut percobaanku, ini mengatasi parameter multipart
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            var id_barang = fields['id_barang'][0];
            if (files['photo_barang'] != undefined) {
                // ada local variable 'files', artinya bisa jadi ada beberapa file yang diterima, formatnya adalah json -> {"<nama_parameter>":[...]}
                var tipefoto = files['photo_barang'][0]['mimetype'].match(/(?<=\/)\w+/g)[0]

                // ada juga local var 'fields', artinya beberapa parameter yang bukan file, formatnya adalah json -> {"<nama_parameter>":[...]}
                console.log('fields: ', fields);
                // kira" outputnya gini -> fields:  { id_barang: [ '343dsfdf' ], nama_barang: [ 'sdadasdad2342442' ] }

                // old path ini adalah lokasi file yang sudah diterima, file ini biasanya ditaruh di temporary folder atau cache
                let oldPath = files['photo_barang'][0].filepath;
                // newpath adalah lokasi dimana pengen menyimpan filenya (<folder>/<nama>.<tipefile>)
                let newPath = `./assets/photo_barang/${id_barang}.jpg`
                // membaca file yang sudah diterima di folder temporary,
                // ini membaca sebagai rawData/Buffer supaya bisa ditulis ulang
                let rawData = fs.readFileSync(oldPath)

                //simpan gambar di folder 'newPath'
                fs.writeFile(newPath, rawData, function (err) {
                    if (err) console.log(err)
                })

                console.log(tipefoto);
                res.send({ success: true });
            }
            // else {
            //     // jika tidak ada file yang dikirim
            //     console.log("tidak ada file");
            //     fs.rm(`./assets/photo_barang/${id_barang}.jpg`, function (err) {
            //         if (err) console.log(err)
            //     })
            //     res.send({ success: true, result: "hapus foto, karena tidak ada foto tidak diterima" })
            // }
        });
    } catch (error) {
        console.log("UPLOADIMAGE/UPLOAD ERR:" + error);
    }
    console.log("FOTO BARANG: DONE");
})

router.delete("/", tesjwt.verifyToken, async (req, res) => {
    console.log("FOTO BARANG: START DELETE");
    try {
        const id_barang = req.query.id_barang
        // membaca direktori
        fs.readdir(`${dirphoto}`, async (err, files) => {
            if (err) {
                res.status(500).send({ msg: `error saat membaca direktori ${dirphoto}}`, error: err });
            } else {
                getFileStartsWith(id_barang + ".", (err2, file) => {
                    if (err2) {
                        console.log(`tidak ada file diawali: ${id_barang}`);
                        res.status(404).send({ msg: `tidak ada file diawali ${id_barang}`, error: err2 })
                    } else {
                        console.log(`hapus foto: ${file}`);
                        fs.rm(`${dirphoto}${file}`, err3 => {
                            if (err3) {
                                res.status(500).send({
                                    msg: `eror saat menghapus foto ${id_barang}`,
                                    error: err3
                                })
                            }
                            else { res.send({ msg: `OK, dihapus: ${file}` }) }
                        })
                    }
                })
            }
        })
    } catch (err) {
        console.log("DELET FOTO BARANG ERROR:" + err);
        res.status(500).send({ error: err })
    }
    console.log("FOTO BARANG: DONE");
})

// teswt.verifytoken ini middleware untuk keamanan API, bagian ini terakhir aja
router.get("/", tesjwt.verifyToken, (req, res) => {
    // console.log("FOTO BARANG: START GET");
    try {
        const id_barang = req.query.id_barang

        getFileStartsWith(id_barang + ".", (err, file) => {
            // ini resolve direktori fotonya, supaya bisa dimasukkan di parameternya res.sendfile
            // intinya harus diresolve direktorinya
            var filePath = path.resolve(__dirname, "." + dirphoto + file)

            if (err) {
                // console.log(`GET: tidak ada file diawali: ${id_barang}`);
                res.status(404).send({ msg: `tidak ada file diawali ${id_barang}`, error: err })
            } else {
                // console.log(`mengirim file ${file}`);
                res.sendFile(filePath, (err2) => {
                    if (err2) {
                        // console.log('GET: eror ngirim file:', err2);
                        res.status(500).send({ msg: `eror saat ngirim file ${file}`, error: err2 });
                    } else {
                        // console.log('GET: File sent successfully');
                    }
                })
            }
        })
    } catch (err) {
        // console.log("GET err");
        res.status(500).send({ error: err })
    }
    // console.log("FOTO BARANG: DONE");
})

function getFileStartsWith(diawali, callback) {
    // console.log(`cari file: ${diawali}`);
    fs.readdir(dirphoto, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            callback(err, null);
            return;
        }

        var file = files.find(e => e.startsWith(diawali))

        if (file) {
            // console.log("File ketemu:", file);
            callback(null, file);
        } else {
            // console.log("File tidak ditemukan");
            callback('File not found', null);
        }
    })
}

module.exports = router