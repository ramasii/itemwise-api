const express = require("express");
const tesjwt = require("../tesjwt");
const dbConfig = require('../dbConfig');

const router = express.Router()

const table = "users" // ubah tabel jika perlu
const fields = ["id_user", "username_user", "email_user", "photo_user", "password_user"]

// get all
router.get(`/`, tesjwt.verifyTokenAdmin, async (req, res) => {
    try {
        dbConfig.query(`SELECT * FROM ${table}`, (err, result) => {
            if (err) {
                res.status(500).send("terjadi eror di server");
                return;
            }
            res.send(result);
            dbConfig.end;
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan pada server");
    }
});

// get by id
router.get(`/byId`, tesjwt.verifyToken, async (req, res) => {
    
    try {
        // ambil data user dari token, memastikan data ini diakses oleh pemilik
        var user_data = await tesjwt.getUserDataByAuth(req.headers['authorization'])
        var id_user = user_data["id_user"]

        dbConfig.query(`SELECT * FROM ${table} 
        WHERE id_user="${id_user}"`, (err, result) => {
            if (err) return;

            if (result != "") {
                res.send(result);
            } else {
                res.send(`data tidak ditemukan: ${id_user}`)
            }
            dbConfig.end;
        });
    } catch (error) {
        console.error("Terjadi kesalahan:", error);
        res.status(500).send("Terjadi kesalahan pada server");
    }
});

// add user
router.post(`/add`, async (req, res) => {
    try {
        var id_user = req.query.id_user
        var username_user = req.query.username_user
        var email_user = req.query.email_user
        var photo_user = req.query.photo_user
        var password_user = req.query.password_user

        var values = [id_user, username_user, email_user, photo_user, password_user]
        var SET = []

        for (const index in fields) {
            SET.push(`${fields[index]}='${values[index]}'`)
        }

        dbConfig.query(`INSERT INTO ${table} (${fields.join(",")}) 
        VALUES (${SET.join(",")})`, (err, result) => {
            if (err) return;

            res.status(200).send(result)
            dbConfig.end;
        });
    } catch (error) {
        console.error("Terjadi kesalahan:", error);
        res.status(500).send("Terjadi kesalahan pada server: " + error);
    }
});

// update user
router.put(`/update`, tesjwt.verifyToken, async (req, res) => {
    try {
        // ambil data user dari token, memastikan data ini diakses oleh pemilik
        var user_data = await tesjwt.getUserDataByAuth(req.headers['authorization'])

        var id_user = user_data["id_user"]
        var username_user = req.query.username_user
        var email_user = req.query.email_user
        var photo_user = req.query.photo_user
        var password_user = req.query.password_user

        var values = [id_user, username_user, email_user, photo_user, password_user]
        var SET = []

        for (const index in fields) {
            if (fields[index] != "id_user") {
                SET.push(`${fields[index]}='${values[index]}'`)
            }
        }

        dbConfig.query(`UPDATE ${table} SET ${SET.join(",")} 
        WHERE id_user="${id_user}"`, (err, result) => {
            if (err) return;

            res.status(200).send(result)
            dbConfig.end;
        });
    } catch (error) {
        console.error("Terjadi kesalahan:", error);
        res.status(500).send("Terjadi kesalahan pada server: " + error);
    }
});

// delete user
router.delete(`/delete/:id_user`, tesjwt.verifyTokenAdmin, async (req, res) => {
    var id_user = req.params.id_user
    try {
        dbConfig.query(`DELETE FROM ${table} where id_user="${id_user}"`, (err, result) => {
            if (err) return;

            if (result != "") {
                res.send(result);
            } else {
                res.send(`data tidak ditemukan: ${id_user}`)
            }
            dbConfig.end;
        });
    } catch (error) {
        console.error("Terjadi kesalahan:", error);
        res.status(500).send("Terjadi kesalahan pada server");
    }
});

module.exports = router
