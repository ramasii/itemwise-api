const jwt = require('jsonwebtoken');
const dbConfig = require('./dbConfig');
const secretKey = 'sungguhAmatSangatRahasiajoer03J)(JEr8uejr03rjjergpksd[gpsg56834r63q32433u89rje'; // Ganti dengan kunci rahasia Anda

function getUserData(email_user, password_user) {
    return new Promise((resolve, reject) => {
        try {
            dbConfig.query(`SELECT * FROM users 
            WHERE email_user='${email_user}' && password_user='${password_user}'`, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });

        } catch (error) {
            reject(error);
        }
    });
}

function getUserByKodeS(email_user, kode_s) {
    return new Promise((resolve, reject) => {
        try {
            dbConfig.query(`SELECT *  FROM kode_sementara
            WHERE email_user='${email_user}' 
            && kode_s='${kode_s}' 
            && status='tersedia'`, (err, result) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(result)
                }
            })
        } catch (error) {
            reject(error)
        }
    })
}

async function getUserDataByAuth(token) {
    // ambil data user dari token, memastikan data ini diakses oleh pemilik
    var decoded = jwt.decode(token)
    var user_data = await getUserData(decoded["email"], decoded["pass"])
        .then(result => {
            return result
        }).catch(error => {
            console.error(error);
            return []
        });
    return user_data[0]
}

const verifyToken = async (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) return res.status(403).send('token not found');

    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).send('token expired');
            }
            return res.status(403).send('token invalid');
        }
        req.user = decoded;
        // console.log(decoded);
        next();
    });
};

const verifyTokenAdmin = async (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) return res.status(403).send('token not found');

    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).send('token expired');
            }
            return res.status(403).send('token invalid');
        }


        const user_data = await getUserData(decoded["email"], decoded["pass"])
            .then(result => {
                // console.log(result)
                return result
            })
            .catch(error => {
                console.error(error);
                return []
            });
        // console.log(user_data);
        const role = user_data[0]["role"]
        if (role != "admin") {
            console.log(user_data[0]);
            return res.status(403).send("<h1>🛑 WOI 🛑</h1>waduh, anda bukan admin😂")
        }

        req.user = decoded;
        // console.log(decoded);
        next();
    });
};


/* function verifyToken(token) {
    // Memverifikasi token
    const receivedToken = token;
    jwt.verify(receivedToken, secretKey, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).send('Token sudah kedaluwarsa');
            }
            return res.status(403).send('Token tidak valid');
        } else {
            console.log('Token valid, data:', decoded);
        }
    });
    
} */

module.exports = { verifyToken, verifyTokenAdmin, getUserData, jwt, secretKey, getUserDataByAuth, getUserByKodeS }
