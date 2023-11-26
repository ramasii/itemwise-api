const express = require("express");
const mysql = require("mysql")
const app = express();
const port = 8000

// ini koneksinya pakai 'createPool' sebagai pengganti 'createConnection'
const koneksi = mysql.createPool({
    // aku belum coba, tapi..
    // parameter 'host' ini bisa diganti ke IP ADDRESS-nya server dari pak suwondo, jadi bisa terkoneksi ke database server
    // kalo mau connect ke server, parameter 'user' sama 'password' diisi sesuai akun kita
    host: "localhost",
    user: "root",
    database: "db_xii_rpl_satu"
})

// we would not use this babe 💖🥰
/* const koneksi = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "db_xii_rpl_satu"
}) */

//ambil semua
app.get("/get", async (req, res) => {
    // try-catch: mencegah server berhenti ketika 'koneksi.query' mengalami eror, they are works like a team 👩‍👦
    // try(coba): "coba dulu deh, kalo eror tak lempar ke si catch 🌠"
    try { 

        // membuat perintah query menggunakan bahasa mysql
        koneksi.query('SELECT * FROM mapel', (err, result) => {

            // jika eror, kirimkan response eror
            if (err) {
                res.status(500).send("terjadi eror di server");

                // return ini digunakan supaya dilanjutkan ke 'catch', dan mencegah server berhenti
                // return juga ga akan menjalankan baris selanjunya: "res.send..." dan "koneksi.release..." ini ga akan dieksekusi, beneran diskip langsung ke 'catch'
                return;
            }

            // tampilkan result sebagai response API
            res.send(result);

            // lepaskan koneksi dari mysql, takutnya server mysql terbebani oleh banyak user 💀
            koneksi.end;
        });
    } catch (error) { // catch(tangkap): "waduuh😮 'try' ngelempar eror!!, GAWAAT😫😫, harus ku tangkap... HAP!!"
        console.error(error);
        res.status(500).send("Terjadi kesalahan pada server");
        // catch(tangkap): "waahh untung gw tangkep, servernya jadi ga berhenti😎😎😎" /dengan nada songong dan merasa paling superheroik
    }
});

// ambil berdasarkan ID
// ':id' ini bisa diisi id dari data nya: localhost:port/get/1, berarti ambil data yang 'id' nya 1
app.get("/get/:id", async (req, res) => {
    var id = req.params.id // 'req.params.<nama parameter>' ini untuk ngambil parameter dari url, ada banyak jenis 'req': body,params,query
    try {
        // untuk memasukkan variabel ke STRING dengan menggunakan simbol ` , bukan ' dan bukan ". terus menggunakan ${<nama variabel>}
        koneksi.query(`SELECT * FROM mapel where id_mapel=${id}`, (err, result) => {
            if (err) return; // jika eror lempar ke 'catch' 🌠🌠🌠

            if(result!=""){ // ini kalo datanya ada
                res.send(result);
            }else{ // ini kalo datanya ga ketemu atau kosong, kosong?? astaghfirullah haladzim... kerjaa lembur bagai kudaa🎠
                res.send(`data tidak ditemukan: ${id}`)
            }
            koneksi.release; // lepaskan konekssiii⚡⚡⚡⚡⚡⚠️⚠️⚠️⚠️✈️⚡⚡⚡⚠️✈️⚡⚡⚡⚠️⚠️⚠️✈️⚡⚡⚠️⚠️⚠️✈️ wuiinngg...... 💥
        });
    } catch (error) {
        console.error("Terjadi kesalahan:", error);
        res.status(500).send("Terjadi kesalahan pada server");
    } // catch(tangkap): "yeah, iam the hero as superman as batman as spiderman as me😎😎😎😎"
});



app.listen(port, () => { console.log("started"); })