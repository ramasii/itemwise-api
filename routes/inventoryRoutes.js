const express = require("express");
const tesjwt = require("../tesjwt");
const dbConfig = require('../dbConfig');

const router = express.Router()

const table = "inventory_user" // ubah tabel jika perlu
const fields = ["id_inventory", "id_user", "nama_inventory"]

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

// get by id_inventory
router.get(`/byId/:id_inventory`, tesjwt.verifyToken, async (req, res) => {
    var id_inventory = req.params.id_inventory

    // ambil data user dari token, memastikan data ini diakses oleh pemilik
    var user_data = await tesjwt.getUserDataByAuth(req.headers['authorization'])
    var id_user = user_data[0]["id_user"]

    try {
        dbConfig.query(`SELECT * FROM ${table} 
        INNER JOIN users ON ${table}.id_user = users.id_user
        WHERE id_inventory="${id_inventory}"
        && ${table}.id_user="${id_user}"`, (err, result) => {
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
// ambil data inventory berdasarkan id_user menggunakan token, jadi satu token untuk satu user
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
                res.send([])
            }
            dbConfig.end;
        });
    } catch (error) {
        console.error("Terjadi kesalahan:", error);
        res.status(500).send("Terjadi kesalahan pada server");
    }
});

// post inventory bulk
router.post(`/addBulk`, tesjwt.verifyToken, async (req, res)=>{
    console.log("POST BULK inv");
    try {
        var user_data = await tesjwt.getUserDataByAuth(req.headers['authorization'])
        var invs = JSON.parse(req.query.invs)
        console.log(user_data);

        var valueAdd = []

        for (index in invs){
            var inv = invs[index]

            var id_inventory = inv['id_inventory']
            var id_user = inv['id_user']
            var nama_inventory = inv['nama_inventory']

            valueAdd.push(`('${id_inventory}','${id_user}','${nama_inventory}')`)
        }

        dbConfig.query(`DELETE FROM ${table} WHERE id_user='${id_user}';`,async(err,result)=>{
            if(err){
                console.log(err);
                return res.status(500).send("internal server err")
            }
        })
        setTimeout(() => {
            dbConfig.query(`INSERT INTO ${table} (${fields.join(',')}) VALUES ${valueAdd.join(",")};`,async(err,result)=>{
                if(err){
                    console.log(err);
                    return res.status(500).send("internal server err")
                }
    
                else if (result) {
                    return res.send(result)
                }
            })
        }, 500);
        // res.send(valueAdd)
        console.log("DONE POST BULK inv");
    } catch (error) {
        console.log(error);
    }
})

// add inventory
router.post(`/add`, tesjwt.verifyToken, async (req, res) => {
    console.log("POST inv");
    try {
        // ambil data user dari token, memastikan data ini diakses oleh pemilik
        // var user_data = await tesjwt.getUserDataByAuth(req.headers['authorization'])
        // console.log(user_data);

        var id_inventory = req.query.id_inventory
        var id_user = req.query.id_user
        var nama_inventory = req.query.nama_inventory

        var values = [id_inventory, id_user, nama_inventory]
        var SET = []
        var valueAdd = []

        for (const index in fields|| values[index] == '') {
            SET.push(`${fields[index]}="${values[index]}"`)
        }
        for (const index in fields|| values[index] == '') {
            valueAdd.push(`"${values[index]}"`)
        }
        console.log(valueAdd);

        // jika id_user == null
        if(id_user == 'null'){
            id_user = null
        }else{
            id_user = `'${id_user}'`
        }

        // Lakukan query untuk mengecek apakah id_inventory sudah ada di database
        dbConfig.query(`SELECT * FROM ${table} WHERE id_inventory = '${id_inventory}'`, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }

            if (result.length > 0) {
                console.log("| edit inv\n");
                // Jika id_inventory sudah ada, lakukan UPDATE
                dbConfig.query(`UPDATE ${table} SET ${SET.join(',')} WHERE id_inventory = '${id_inventory}'`, (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Internal Server Error');
                    }
                    
                    res.status(200).send(result);
                    // dbConfig.end();
                });
            } else {
                console.log("| add inv\n");
                // Jika id_inventory belum ada, lakukan INSERT
                dbConfig.query(`INSERT INTO ${table} (${fields.join(',')}) VALUES ('${id_inventory}',${id_user},'${nama_inventory}')`, (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Internal Server Error');
                    }

                    res.status(200).send(result);
                    // dbConfig.end();
                });
            }
        });

        /* dbConfig.query(`INSERT INTO ${table} (${fields.join(",")}) 
        VALUES (${valueAdd.join(",")})`, (err, result) => {
            if (err) return;

            res.status(200).send(result)
            dbConfig.end;
        }); */
    } catch (error) {
        console.error("Terjadi kesalahan:", error);
        res.status(500).send("Terjadi kesalahan pada server: " + error);
    }
});

// update inventory
router.put(`/update`, tesjwt.verifyToken, async (req, res) => {
    try {
        // ambil data user dari token, memastikan data ini diakses oleh pemilik
        var user_data = await tesjwt.getUserDataByAuth(req.headers['authorization'])

        var id_inventory = req.query.id_inventory
        var id_user = req.query.id_user
        var nama_inventory = req.query.nama_inventory

        var values = [id_inventory, id_user, nama_inventory]
        var SET = []

        for (const index in fields) {
            if (fields[index] != "id_inventory") {
                SET.push(`${fields[index]}='${values[index]}'`)
            }
        }

        dbConfig.query(`UPDATE ${table} SET ${SET.join(",")} 
        WHERE id_inventory="${id_inventory}"`, (err, result) => {
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
router.delete(`/delete`, tesjwt.verifyToken, async (req, res) => {
    var id_inventory = req.query.id_inventory
    const token = req.headers['authorization'];
    try {
        // ambil data user dari token, memastikan data ini diakses oleh pemilik
        var user_data = await tesjwt.getUserDataByAuth(req.headers['authorization'])

        dbConfig.query(`DELETE FROM ${table} WHERE id_inventory="${id_inventory}" `, (err, result) => {
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

// delete by user
router.delete(`/deleteByUser`, tesjwt.verifyToken, async (req, res) => {
    var id_user = req.query.id_user
    const token = req.headers['authorization'];
    try {
        // ambil data user dari token, memastikan data ini diakses oleh pemilik
        var user_data = await tesjwt.getUserDataByAuth(req.headers['authorization'])

        dbConfig.query(`DELETE FROM ${table} WHERE id_user="${id_user}" `, (err, result) => {
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