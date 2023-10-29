const express = require("express");
const mysql = require("mysql")
const dbConfig = require('../dbConfig');

const router = express.Router()

const table = "data_barang" // ubah tabel jika perlu
const fields = ["id_barang", "id_user", "id_inventory", "kode_barang", "nama_barang", "catatan", "stok_barang", "harga_beli", "harga_jual", "photo_barang", "added", "edited"]

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

// get by id_barang
router.get(`/:id_barang`, async (req, res) => {
    var id_barang = req.params.id_barang
    try {
        dbConfig.query(`SELECT * FROM ${table} 
            INNER JOIN inventory_user ON ${table}.id_inventory=inventory_user.id_inventory 
            INNER JOIN users ON ${table}.id_user = users.id_user
            WHERE id_barang="${id_barang}"`, (err, result) => {
            if (err) return;

            if (result != "") {
                res.send(result);
            } else {
                res.send(`data tidak ditemukan: ${id_barang}`)
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

// get by id_inventory
router.get(`/byInventory/:id_inventory`, async (req, res) => {
    var id_inventory = req.params.id_inventory
    try {
        dbConfig.query(`SELECT * FROM ${table} INNER JOIN inventory_user ON ${table}.id_inventory=inventory_user.id_inventory WHERE ${table}.id_inventory="${id_inventory}"`, (err, result) => {
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

// add item
router.post(`/`, async (req, res) => {
    try {
        var id_barang = req.query.id_barang
        var id_user = req.query.id_user
        var id_inventory = req.query.id_inventory
        var kode_barang = req.query.kode_barang
        var nama_barang = req.query.nama_barang
        var catatan = req.query.catatan
        var stok_barang = req.query.stok_barang
        var harga_beli = req.query.harga_beli
        var harga_jual = req.query.harga_jual
        var photo_barang = req.query.photo_barang
        var added = req.query.added
        var edited = req.query.edited

        var values = [id_barang, id_user, id_inventory, kode_barang, nama_barang, catatan, stok_barang, harga_beli, harga_jual, photo_barang, added, edited].join(",")

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
router.put(`/:id_barang`, async (req, res) => {
    try {
        
        var id_barang = req.params.id_barang
        var id_user = req.query.id_user
        var id_inventory = req.query.id_inventory
        var kode_barang = req.query.kode_barang
        var nama_barang = req.query.nama_barang
        var catatan = req.query.catatan
        var stok_barang = req.query.stok_barang
        var harga_beli = req.query.harga_beli
        var harga_jual = req.query.harga_jual
        var photo_barang = req.query.photo_barang
        var added = req.query.added
        var edited = req.query.edited

        var values = [id_barang, id_user, id_inventory, kode_barang, nama_barang, catatan, stok_barang, harga_beli, harga_jual, photo_barang, added, edited]
        var SET = []

        for (const index in fields) {
            if (fields[index] != "id_barang") {
                SET.push(`${fields[index]}=${values[index]}`)
            }
        }

        dbConfig.query(`UPDATE ${table} SET ${SET.join(",")} WHERE id_barang="${id_barang}"`, (err, result) => {
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
router.delete(`/:id_barang`, async (req, res) => {
    var id_barang = req.params.id_barang
    try {
        dbConfig.query(`DELETE FROM ${table} where id_barang="${id_barang}"`, (err, result) => {
            if (err) return;

            if (result != "") {
                res.send(result);
            } else {
                res.send(`data tidak ditemukan: ${id_barang}`)
            }
            dbConfig.end;
        });
    } catch (error) {
        console.error("Terjadi kesalahan:", error);
        res.status(500).send("Terjadi kesalahan pada server");
    }
});

module.exports = router
