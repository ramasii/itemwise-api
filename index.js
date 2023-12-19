const express = require('express');
const app = express()
const cors = require("cors")
const anu = `/xiirpl1_03/api`
const port = 8003;

app.use(cors())
app.use(express.urlencoded({extended: true}));

// impor rute
const userRoutes = require("./routes/userRoutes")
const inventoryRoutes = require("./routes/inventoryRoutes")
const barangRoutes = require("./routes/barangRoutes")
const authRoutes = require("./routes/authRoutes")
const uploadImage = require("./routes/uploadImage")

// gunakan rute yang akan diimpor: app.use(<endpoint>, <rute>)
app.use(`${anu}/users`, userRoutes)
app.use(`${anu}/inventory`, inventoryRoutes)
app.use(`${anu}/barang`, barangRoutes)
app.use(`${anu}/auth`, authRoutes)
app.use(`${anu}/image`, uploadImage)

// jalankan server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
