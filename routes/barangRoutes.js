const express = require("express");
const tesjwt = require("../tesjwt");
const dbConfig = require('../dbConfig');

const router = express.Router()

const table = "data_barang" // ubah tabel jika perlu
const fields = ["id_barang", "id_user", "id_inventory", "kode_barang", "nama_barang", "catatan", "stok_barang", "harga_beli", "harga_jual", "added", "edited"]

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
    console.log("get barang by user");

    // ambil data user dari token, memastikan data ini diakses oleh pemilik
    var user_data = await tesjwt.getUserDataByAuth(req.headers['authorization'])
    var id_user = user_data["id_user"]
    console.log(user_data);

    try {
        dbConfig.query(`SELECT * FROM ${table} WHERE id_user="${id_user}"`, (err, result) => {
            if (err) return;

            if (result != "") {
                res.send(result);
            } else {
                res.send([])
            }
            dbConfig.end;
        });
    } catch (error) {
        console.log("Terjadi kesalahan:", error);
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

// add item bulk
router.post(`/addBulk`, tesjwt.verifyToken, async (req, res) => {
    console.log("POST BULK brg");
    try {
        var user_data = await tesjwt.getUserDataByAuth(req.headers['authorization'])
        var items = JSON.parse(req.query.items)
        console.log(user_data);

        var valueAdd = []

        for (index in items) {
            var item = items[index]

            var id_barang = item['id_barang']
            var id_user = user_data["id_user"]
            var id_inventory = item['id_inventory'] == 'null' ? 'null' : `'${item['id_inventory']}'`
            var kode_barang = item['kode_barang']
            var nama_barang = item['nama_barang']
            var catatan = item['catatan']
            var stok_barang = item['stok_barang']
            var harga_beli = item['harga_beli']
            var harga_jual = item['harga_jual']
            var added = item['added']
            var edited = item['edited']

            valueAdd.push(`('${id_barang}','${id_user}',${id_inventory},'${kode_barang}','${nama_barang}','${catatan}','${stok_barang}','${harga_beli}','${harga_jual}','${added}','${edited}')`)
        }
        dbConfig.query(`DELETE FROM ${table} WHERE id_user='${id_user}';`,async (err,result)=>{
            if(err){
                console.log(err);
                return res.status(500).send("internal server err")
            }
            else if(result){
                console.log(result);
            }
        })
        
        setTimeout(() => {
            dbConfig.query(`INSERT INTO ${table} (${fields.join(',')}) VALUES ${valueAdd.join(",")};`, async (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send("internal server err");
                } else if (result) {
                    return res.send(result);
                }
            });
        }, 500); 
        // res.send(valueAdd)
        console.log("DONE POST BULK brg");
    } catch (error) {
        console.log(error);
    }
})

// add item
router.post(`/add`, tesjwt.verifyToken, async (req, res) => {
    console.log("POST brg");
    try {
        // ambil data user dari token, memastikan data ini diakses oleh pemilik
        var user_data = await tesjwt.getUserDataByAuth(req.headers['authorization'])
        console.log(user_data);

        var id_barang = req.query.id_barang
        var id_user = req.query.id_user == 'null' ? 'null' : `'${req.query.id_user}'`
        var id_inventory = req.query.id_inventory == 'null' ? 'null' : `'${req.query.id_inventory}'`
        var kode_barang = req.query.kode_barang
        var nama_barang = req.query.nama_barang
        var catatan = req.query.catatan
        var stok_barang = req.query.stok_barang
        var harga_beli = req.query.harga_beli
        var harga_jual = req.query.harga_jual
        var added = req.query.added
        var edited = req.query.edited

        // yang pertama hapus barang yang ada, lalu tambahkan (replace data)
        dbConfig.query(`DELETE FROM ${table} WHERE id_barang='${id_barang}';`,async (err,result)=>{
            if(err){
                console.log(err);
                return res.status(500).send({"msg":"server err"})
            }
            else if(result){
                console.log(result);
            }
        })

        setTimeout(() => {
            dbConfig.query(`INSERT INTO ${table} (${fields.join(',')}) VALUES ('${id_barang}',${id_user},${id_inventory},'${kode_barang}','${nama_barang}','${catatan}',${stok_barang},${harga_beli},${harga_jual},'${added}','${edited}')`, (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Internal Server Error');
                }
                res.status(200).send(result);
            });
        }, 1);
        
    } catch (error) {
        console.error("Terjadi kesalahan:", error);
        res.status(500).send("Terjadi kesalahan pada server: " + error);
    }
});

// update item
router.put(`/update`, tesjwt.verifyToken, async (req, res) => {
    try {
        // ambil data user dari token, memastikan data ini diakses oleh pemilik
        var user_data = await tesjwt.getUserDataByAuth(req.headers['authorization'])

        var id_barang = `${req.query.id_barang}`
        var id_user = req.query.id_user == undefined ? `${user_data['id_user']}` : `${req.query.id_user}`
        var id_inventory = req.query.id_inventory != 'null' ? `'${req.query.id_inventory}'` : `null`
        var kode_barang = `${req.query.kode_barang}`
        var nama_barang = `${req.query.nama_barang}`
        var catatan = `${req.query.catatan}`
        var stok_barang = req.query.stok_barang
        var harga_beli = req.query.harga_beli
        var harga_jual = req.query.harga_jual
        var added = `${req.query.added}`
        var edited = `${req.query.edited}`

        console.log(`UPDATE data_barang SET 
        id_user='${id_user}',
        id_inventory='${id_inventory}',
        kode_barang='${kode_barang}',
        nama_barang='${nama_barang}',
        catatan='${catatan}',
        stok_barang=${stok_barang},
        harga_beli=${harga_beli},
        harga_jual=${harga_jual},
        added='${added}',
        edited='${edited}'
        WHERE id_barang="${id_barang}"`);

        dbConfig.query(`UPDATE data_barang SET 
        id_user='${id_user}',
        id_inventory=${id_inventory},
        kode_barang='${kode_barang}',
        nama_barang='${nama_barang}',
        catatan='${catatan}',
        stok_barang=${stok_barang},
        harga_beli=${harga_beli},
        harga_jual=${harga_jual},
        added='${added}',
        edited='${edited}'
        WHERE id_barang="${id_barang}"`, (err, result) => {
            if (err) return;

            res.status(200).send(result)
            dbConfig.end;
        });
        // dbConfig.query(`UPDATE ${table} SET ${SET.join(",")} 
        // WHERE id_barang="${id_barang}"
        // && ${table}.id_user='${id_user}'`, (err, result) => {
        //     if (err) return;

        //     res.status(200).send(result)
        //     dbConfig.end;
        // });
    } catch (error) {
        console.error("Terjadi kesalahan:", error);
        res.status(500).send("Terjadi kesalahan pada server: " + error);
    }
});

// delete
router.delete(`/delete`, tesjwt.verifyToken, async (req, res) => {
    var id_barang = req.query.id_barang

    try {
        // ambil data user dari token, memastikan data ini diakses oleh pemilik
        var user_data = await tesjwt.getUserDataByAuth(req.headers['authorization'])

        dbConfig.query(`DELETE FROM ${table} WHERE id_barang="${id_barang}"`, (err, result) => {
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
