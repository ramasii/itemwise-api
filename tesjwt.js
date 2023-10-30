const jwt = require('jsonwebtoken');
const dbConfig = require('./dbConfig');
const secretKey = 'sungguhAmatSangatRahasiajoer03J)(JEr8uejr03rjjergpksd[gpsg56834r63q32433u89rje'; // Ganti dengan kunci rahasia Anda

function loadToken(email_user, password_user) {
    // Membuat token
    const payload = { email: email_user, pass: password_user };
    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
    return token
}

function getUserData(email_user) {
    return new Promise((resolve, reject) => {
        try {
            dbConfig.query(`SELECT * FROM users WHERE email_user='${email_user}'`, (err, result) => {
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

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) return res.status(403).send('token not found');

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).send('token expired');
            }
            return res.status(403).send('token invalid');
        }
        req.user = decoded;
        console.log(decoded);
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
        

        const user_data = await getUserData(decoded["email"])
        .then(result => {
            // console.log(result)
            return result
        })
        .catch(error => {
            console.error(error);
            return []
        });
        const role = user_data[0]["role"]
        if (role != "admin"){
            return res.status(403).send("waduh, anda bukan admin")
        }

        req.user = decoded;
        console.log(decoded);
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

module.exports = { verifyToken, loadToken, verifyTokenAdmin }
