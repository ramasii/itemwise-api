const express = require("express");
const tesjwt = require("../tesjwt");
const dbConfig = require('../dbConfig');
const nodemailer = require('nodemailer');
const mailgen = require('mailgen')
const router = express.Router()

const table = "kode_sementara" // ubah tabel jika perlu
const fields = ["id_kode_s", "email_user", "kode_s", "status", "added"]

router.get('/', tesjwt.verifyToken, async (req, res) => {
    try {
        dbConfig.query(`SELECT * FROM ${table}`, (err, result) => {
            if (err) {
                res.status(500).send(`error database: ${err}`)
                return
            }
            res.send(result);
        })
    } catch (error) {
        console.log(`kodeSRoute error: ${error}`);
        res.status(500).send(`kesalahan pada server: ${err}`)
    }
})

// get by id
router.get('/byId/:id', tesjwt.verifyToken, async (req, res) => {
    try {
        var id_kode_s = req.params.id

        dbConfig.query(`SELECT * FROM ${table} WHERE id_kode_s="${id_kode_s}"`, (err, result) => {
            if (err) {
                res.status(500).send(`error database: ${err}`)
                return
            }
            res.send(result);
        })
    } catch (error) {
        console.log(`kodeSRoute error: ${error}`);
        res.status(500).send(`kesalahan pada server: ${err}`)
    }
})

// get by kode_s & email_user
// digunakan untuk mencocokkan kode_s yg diinput user
router.get('/matching', async (req, res) => {
    // router.get('/matching', tesjwt.verifyToken, async (req, res) => {
    try {
        var kode_s = req.query.kode_s
        var email_user = req.query.email_user

        dbConfig.query(`SELECT * FROM ${table} 
        WHERE kode_s="${kode_s}" 
        && email_user="${email_user}"
        && status="tersedia"`, (err, result) => {
            if (err) {
                res.status(500).send(`error database: ${err}`)
                return
            }
            res.send(result);
        })

        setTimeout(() => {
            // console.log("part 2");
            dbConfig.query(`UPDATE ${table} SET status='selesai' WHERE kode_s='${kode_s}' && email_user='${email_user}'`, (err, result) => {
                if (err) {
                    console.log(err);
                    // res.status(500).send(`error database: ${err}`)
                    return
                }
            })
        }, 500)
    } catch (error) {
        console.log(`kodeSRoute error: ${error}`);
        res.status(500).send(`kesalahan pada server: ${err}`)
    }
})

// get by email_user
router.get('/byUser', tesjwt.verifyToken, async (req, res) => {
    try {
        var email_user = req.query.email_user

        dbConfig.query(`SELECT * FROM ${table} WHERE email_user="${email_user}"`, (err, result) => {
            if (err) {
                res.status(500).send(`error database: ${err}`)
                return
            }
            res.status(200).send(result);
        })
    } catch (error) {
        console.log(`kodeSRoute error: ${error}`);
        res.status(500).send(`kesalahan pada server: ${err}`)
    }
})

// edit
router.put('/', tesjwt.verifyToken, async (req, res) => {
    try {
        var id_kode_s = req.query.id_kode_s
        var email_user = req.query.email_user != 'null' ? `'${req.query.email_user}'` : 'null'
        var kode_s = req.query.kode_s
        var status = req.query.status
        var added = req.query.added

        dbConfig.query(`UPDATE ${table} SET
        id_kode_s = '${id_kode_s}',
        email_user = '${email_user}',
        kode_s = '${kode_s}',
        status = '${status}',
        added = '${added}'
        WHERE id_kode_s=${id_kode_s}`, (err, result) => {
            if (err) {
                res.status(500).send(`error database: ${err}`)
                return
            }
            res.status(200).send(result);
        })
    } catch (error) {
        console.log(`kodeSRoute error: ${error}`);
        res.status(500).send(`kesalahan pada server: ${err}`)
    }
})

// add
router.post('/', async (req, res) => {
    console.log("add kode sementara");
    try {
        var id_kode_s = req.query.id_kode_s
        var email_user = req.query.email_user != 'null' ? `'${req.query.email_user}'` : 'null'
        var date = new Date()
        var added = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.toLocaleTimeString().replace(/\./g, ':')}`
        var kode_s = randomText(6)
        var status = 'tersedia'

        console.log(email_user + " - " + id_kode_s + " - " + added);

        dbConfig.query(`INSERT INTO ${table} VALUES ('${id_kode_s}', ${email_user}, '${kode_s}', '${status}', '${added}')`, (err, result) => {
            if (err) {
                res.status(500).send(`error database: ${err}`)
                return
            }
            // TODO: tambahkan nodemailer

            // jika email tidak null
            if (email_user != 'null') {

                const mailTransporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'amdramadhani221005@gmail.com',
                        pass: 'gergydqxiveenudh'
                    }
                })

                const mailGenerator = new mailgen({
                    theme: "default",
                    product: {
                        name: "Mailgen",
                        link: "https://mailgen.js"
                    }
                })

                const mail = mailGenerator.generate({
                    body: {
                        title: "Item Wise",
                        name: email_user,
                        intro: "Kami menerima permintaan ubah password dari akun Anda, berikut adalah kode sementara untuk melanjutkan",
                        table:{
                            data:[
                                {
                                    Kode:kode_s,
                                    Dibuat:added
                                }
                            ]
                        },
                        outro: "Jika bukan Anda maka abaikan pesan ini",
                        signature: "Terima kasih"
                    }
                })

                const sendOptions = {
                    from: 'no-reply <Item Wise>',
                    to: req.query.email_user,
                    subject: 'Jangan bagikan kode ini ke siapapun termasuk pihak Item Wise!',
                    html: mail
                    // text: `Kami menerima permintaan ubah password dari akun Anda, berikut adalah kode sementara untuk melanjutkan\n \n${kode_s}\n \nJika bukan Anda maka abaikan pesan ini`
                }

                mailTransporter.sendMail(sendOptions, function (error, info) {
                    if (error) {
                        console.log(`sendmail eror: ${error}`);
                    } else {
                        console.log(`sendmail sukses: ${info.response}`);
                        // console.log(`sendmail sukses: ${JSON.stringify(info)}`);
                    }
                })
            }

            res.status(200).send(result);
        })
    } catch (error) {
        console.log(`kodeSRoute error: ${error}`);
        res.status(500).send(`kesalahan pada server: ${err}`)
    }
})

// delete
router.delete('/:id', tesjwt.verifyToken, async (req, res) => {
    try {
        var id_kode_s = req.params.id
        dbConfig.query(`DELETE FROM ${table} WHERE id_kode_s = ${id_kode_s}`, (err, result) => {
            if (err) {
                res.status(500).send(`error database: ${err}}`)
                return
            }
            res.send(result)
        })
    } catch (error) {
        console.log(`kodeSRoute error: ${error}`);
        res.status(500).send(`kesalahan pada server: ${err}`)
    }
})




//  ---------------------- fungsi
function randomText(length) {
    var result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    var counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}


module.exports = router