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
        const satpam = await tesjwt.getUserData(email_user, password_user)
        if (satpam.length == 0) {
            res.status(403).send("<h1>🛑 WOI 🛑</h1>waduh, jangan gitu lah masbro😂")
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

module.exports = router

// ini untuk autentikasi, hanya user/admin yang sudah dimasukkan di dalam database
// yang belum ada di database maka tidak bisa melakukakn auth