const { resolve } = require('promise');
const collections = require('../config/collections')
const db = require('../config/connection')
const bcrypt = require('bcrypt');

module.exports = {
    doSignup(userData) {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10)
            db.get().collection(collections.USERS_COLLECTION).insertOne(userData)
            .then(data => {
                resolve()
            })
        })
    },
    doLogin(userData) {
        let loginStatus = false;
        const response = {}

        return new Promise(async (resolve, reject) => {
            const user = await db.get().collection(collections.USERS_COLLECTION).findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.password, user.password).then(status => {
                    if (status) {
                        console.log("Login Successful"+ user)
                        response.user = user;
                        response.status = true;
                        resolve(response)
                    } else {
                        console.log("Login Failed");
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("User is Not Valid")
                resolve({ status: false })
            }
        })
    }
}