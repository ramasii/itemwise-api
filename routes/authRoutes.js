const express = require('express');
const tesjwt = require('../tesjwt');
const router = express.Router()
const jwt = require("jsonwebtoken")
const secretKey = 'sungguhAmatSangatRahasiajoer03J)(JEr8uejr03rjjergpksd[gpsg56834r63q32433u89rje';

router.get('/', async (req, res) => {
    console.log("auth baru");
    try {
        var email_user = req.query.email_user
        var password_user = req.query.password_user

        // dapatkan data user, apakah datanya ditemukan
        const userData = await tesjwt.getUserData(email_user, password_user)
        if (userData.length == 0) {
            res.status(403).send("data yang dimaksud tidak ada")
        } else {
            const payload = { email: email_user, pass: password_user };
            const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
            res.status(200).send({ "msg":"success","token": token })
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan pada server");
    }
})

router.get('/shortAuth', async (req, res)=>{
    console.log("short auth baru")
    try {
        var email_user = req.query.email_user
        var kode_s = req.query.kode_s

        // dapatkan data kode_s
        const kodeData = await tesjwt.getUserByKodeS(email_user, kode_s)

        if(kodeData.length == 0){
            res.status(403).send("data yang dimaksud tidak ada")
        }else{
            const payload = {email:email_user, kode_s:kode_s}
            const token = jwt.sign(payload, secretKey, {expiresIn: '1m'})
            res.send({"msg":"success","token":token})
        }

    } catch (error) {
        console.log(`short auth eror: ${error}`);
    }
})

module.exports = router

// ini untuk autentikasi, hanya user/admin yang sudah dimasukkan di dalam database
// yang belum ada di database maka tidak bisa melakukakn auth