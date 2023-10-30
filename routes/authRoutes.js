const express = require('express');
const router = express.Router()
const jwt = require("jsonwebtoken")
const secretKey = 'sungguhAmatSangatRahasiajoer03J)(JEr8uejr03rjjergpksd[gpsg56834r63q32433u89rje';

router.get('/', async (req, res) => {
    try {
        var email_user = req.query.email_user
        var password_user = req.query.password_user

        const payload = { email: email_user, pass: password_user };
        const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
        res.send({ "token": token })
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan pada server");
    }
})

module.exports = router