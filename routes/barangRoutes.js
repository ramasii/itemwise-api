const express = require("express");
const tesjwt = require("../tesjwt");
const dbConfig = require('../dbConfig');

const router = express.Router()

const table = "data_barang" // ubah tabel jika perlu
const fields = ["id_barang", "id_user", "id_inventory", "kode_barang", "nama_barang", "catatan", "stok_barang", "harga_beli", "harga_jual", "photo_barang", "added", "edited"]

// get all
router.get(`/`, tesjwt.verifyTokenAdmin, async (req, res) => {
    try {
        dbConfig.query(`SELECT * FROM ${table}
        INNER JOIN inventory_user ON ${table}.id_inventory=inventory_user.id_inventory 
        INNER JOIN users ON ${table}.id_user = users.id_user`, (err, result) => {
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
router.get(`/byId/:id_barang`, tesjwt.verifyToken, async (req, res) => {
    var id_barang = req.params.id_barang

    try {
        // ambil data user dari token, memastikan data ini diakses oleh pemilik
        var user_data = await tesjwt.getUserDataByAuth(req.headers['authorization'])

        dbConfig.query(`SELECT * FROM ${table} 
            INNER JOIN inventory_user ON ${table}.id_inventory=inventory_user.id_inventory 
            INNER JOIN users ON ${table}.id_user = users.id_user
            WHERE id_barang="${id_barang}"
            && ${table}.id_user="${user_data["id_user"]}"`, (err, result) => {
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
router.get(`/byUser`, tesjwt.verifyToken, async (req, res) => {

    // ambil data user dari token, memastikan data ini diakses oleh pemilik
    var user_data = await tesjwt.getUserDataByAuth(req.headers['authorization'])
    var id_user = user_data["id_user"]

    try {
        dbConfig.query(`SELECT * FROM ${table} 
        WHERE ${table}.id_user="${id_user}"`, (err, result) => {
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
router.get(`/byInventory/:id_inventory`, tesjwt.verifyToken, async (req, res) => {
    var id_inventory = req.params.id_inventory

    // ambil data user dari token, memastikan data ini diakses oleh pemilik
    var user_data = await tesjwt.getUserDataByAuth(req.headers['authorization'])

    try {
        dbConfig.query(`SELECT * FROM ${table} 
        INNER JOIN inventory_user ON ${table}.id_inventory=inventory_user.id_inventory 
        WHERE ${table}.id_inventory="${id_inventory}"
        && ${table}.id_users="${user_data["id_user"]}"`, (err, result) => {
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
router.post(`/add`, tesjwt.verifyToken, async (req, res) => {
    console.log("POST brg");
    try {
        // ambil data user dari token, memastikan data ini diakses oleh pemilik
        var user_data = await tesjwt.getUserDataByAuth(req.headers['authorization'])
        console.log(user_data);

        var id_barang = req.query.id_barang
        var id_user = user_data["id_user"]
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
        var valueAdd = []

        for (const index in fields) {
            // jika nilainya bukan numerik
            if ((isNaN(values[index]) && values[index] != 'null') || values[index] == '') {
                SET.push(`${fields[index]}='${values[index]}'`)
            }
            // jika nilainya numerik
            else {
                SET.push(`${fields[index]}=${values[index]}`)
            }
        }

        for (const index in fields) {
            if ((isNaN(values[index]) && values[index] != 'null') || values[index] == '') {
                valueAdd.push(`'${values[index]}'`)
            }
            // jika nilainya numerik
            else {
                valueAdd.push(`${values[index]}`)
            }
        }

        // Lakukan query untuk mengecek apakah id_barang sudah ada di database
        dbConfig.query(`SELECT * FROM ${table} WHERE id_barang = '${id_barang}'`, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }

            if (result.length > 0) {
                console.log("| add brg\n");
                // Jika id_barang sudah ada, lakukan UPDATE
                dbConfig.query(`UPDATE ${table} SET ${SET.join(',')} WHERE id_barang = '${id_barang}'`, (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Internal Server Error');
                    }

                    res.status(200).send(result);
                    // dbConfig.end();
                });
            } else {
                console.log("| edit brg\n");
                // Jika id_barang belum ada, lakukan INSERT
                dbConfig.query(`INSERT INTO ${table} (${fields.join(',')}) VALUES (${valueAdd.join(',')})`, (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Internal Server Error');
                    }

                    res.status(200).send(result);
                    // dbConfig.end();
                });
            }
        });
    } catch (error) {
        console.error("Terjadi kesalahan:", error);
        res.status(500).send("Terjadi kesalahan pada server: " + error);
    }
});

// update item
router.put(`/update/:id_barang`, tesjwt.verifyToken, async (req, res) => {
    try {
        // ambil data user dari token, memastikan data ini diakses oleh pemilik
        var user_data = await tesjwt.getUserDataByAuth(req.headers['authorization'])

        var id_barang = req.params.id_barang
        var id_user = user_data["id_user"]
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
            // jika nilainya bukan numerik
            if (isNaN(values[index])) {
                SET.push(`${fields[index]}='${values[index]}'`)
            }
            // jika nilainya numerik
            else {
                SET.push(`${fields[index]}=${values[index]}`)
            }
        }

        dbConfig.query(`UPDATE ${table} SET ${SET.join(",")} 
        WHERE id_barang="${id_barang}"
        && ${table}.id_user='${id_user}'`, (err, result) => {
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
router.delete(`/delete/:id_barang`, tesjwt.verifyToken, async (req, res) => {
    var id_barang = req.params.id_barang

    try {
        // ambil data user dari token, memastikan data ini diakses oleh pemilik
        var user_data = await tesjwt.getUserDataByAuth(req.headers['authorization'])

        dbConfig.query(`DELETE FROM ${table} 
        WHERE id_barang="${id_barang}"
        && ${table}.id_user='${user_data["id_user"]}'`, (err, result) => {
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
