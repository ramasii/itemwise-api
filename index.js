const express = require('express');
const app = express()
const anu = `/xiirpl1_03/api`
const port = 8003;

// impor rute
const userRoutes = require("./routes/userRoutes")
const inventoryRoutes = require("./routes/inventoryRoutes")
const barangRoutes = require("./routes/barangRoutes")

// gunakan rute yang akan diimpor: app.use(<endpoint>, <rute>)
app.use(`${anu}/users`, userRoutes)
app.use(`${anu}/inventory`, inventoryRoutes)
app.use(`${anu}/barang`, barangRoutes)

// jalankan server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
