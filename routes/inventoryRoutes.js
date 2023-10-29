const express = require("express");
const mysql = require("mysql")
const dbConfig = require('../dbConfig');

const router = express.Router()

const table = "inventory_user" // ubah tabel jika perlu
const fields = ["id_inventory", "id_user", "nama_inventory"]

// get all
router.get(`/`, async (req, res) => {
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

// get by id_inventory
router.get(`/:id_inventory`, async (req, res) => {
    var id_inventory = req.params.id_inventory
    try {
        dbConfig.query(`SELECT * FROM ${table} where id_inventory="${id_inventory}"`, (err, result) => {
            if (err) return;

            if (result != "") {
                res.send(result);
            } else {
                res.send(`data tidak ditemukan: ${id_inventory}`)
            }
            dbConfig.end;
        });
    } catch (error) {
        console.error("Terjadi kesalahan:", error);
        res.status(500).send("Terjadi kesalahan pada server");
    }
});

// get by id_user
router.get(`/byUser/:id_user`, async (req, res) => {
    var id_user = req.params.id_user
    try {
        dbConfig.query(`SELECT * FROM ${table} INNER JOIN users ON ${table}.id_user=users.id_user WHERE ${table}.id_user="${id_user}"`, (err, result) => {
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

// add item
router.post(`/`, async (req, res) => {
    try {
        var id_inventory = req.query.id_inventory
        var id_user = req.query.id_user
        var nama_inventory = req.query.nama_inventory

        var values = [id_inventory, id_user, nama_inventory].join(",")

        dbConfig.query(`INSERT INTO ${table} (${fields.join(",")}) VALUES (${values})`, (err, result) => {
            if (err) return;

            res.status(200).send(result)
            dbConfig.end;
        });
    } catch (error) {
        console.error("Terjadi kesalahan:", error);
        res.status(500).send("Terjadi kesalahan pada server: " + error);
    }
});

// update item
router.put(`/:id_inventory`, async (req, res) => {
    try {
        var id_inventory = req.params.id_inventory
        var id_user = req.query.id_user
        var nama_inventory = req.query.nama_inventory

        var values = [id_inventory, id_user, nama_inventory]
        var SET = []

        for (const index in fields) {
            if(fields[index]!="id_inventory"){
                SET.push(`${fields[index]}=${values[index]}`)
            }
        }

        dbConfig.query(`UPDATE ${table} SET ${SET.join(",")} WHERE id_inventory="${id_inventory}"`, (err, result) => {
            if (err) return;

            res.status(200).send(result)
            dbConfig.end;
        });
    } catch (error) {
        console.error("Terjadi kesalahan:", error);
        res.status(500).send("Terjadi kesalahan pada server: " + error);
    }
});

// delete
router.delete(`/:id_inventory`, async (req, res) => {
    var id_inventory = req.params.id_inventory
    try {
        dbConfig.query(`DELETE FROM ${table} where id_inventory="${id_inventory}"`, (err, result) => {
            if (err) return;

            if (result != "") {
                res.send(result);
            } else {
                res.send(`data tidak ditemukan: ${id_inventory}`)
            }
            dbConfig.end;
        });
    } catch (error) {
        console.error("Terjadi kesalahan:", error);
        res.status(500).send("Terjadi kesalahan pada server");
    }
});

module.exports = router
