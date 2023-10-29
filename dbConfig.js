const mysql = require('mysql');

const koneksi = mysql.createPool({
    host: "localhost",
    user: "root",
    database: "xiirpl1_03"
});

module.exports = koneksi;
