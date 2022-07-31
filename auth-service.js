const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    userName: {
        type: String,
        unique : true
    },
    password: String,
    email: String,
    loginHistory : [{
        dateTime: Date,
        userAgent: String
    }]
});

let User;

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://demo:demo@cluster0.eyeli.mongodb.net/demo?retryWrites=true&w=majority");
        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
    });
        db.once('open', ()=>{
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

exports.registerUser = (userData) => {
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            reject("Passwords do not match");
        }
        else {
            bcrypt.hash(userData.password, 10).then(hash=>{
                userData.password = hash;
                let newUser = new User(userData);
                newUser.save((err) => {
                    if (err) {
                        if (err.code === 11000) {
                            reject("User Name already taken");
                        }
                        else {
                            reject("There was an error creating the user: " + err);
                        }
                    }
                    else {
                        resolve();
                    }
                })
            })
            .catch(err=>{
            console.log(err); // Show any errors that occurred during the process
            });
        }
    })
};



exports.checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.find({userName: userData.userName})
        .exec()
        .then(users => {
            bcrypt.compare(userData.password, users[0].password).then(res => {
                if(res === true) {   
                    users[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent:userData.userAgent});
                    User.update(
                        { userName: users[0].userName },
                        { $set: {loginHistory: users[0].loginHistory} },
                        { multi: false }
                    )
                    .exec()
                    .then(() => {resolve(users[0])})
                    .catch(err => {reject("There was an error verifying the user: " + err)})
                }
                else {
                    reject("Incorrect Password for user: " + userData.userName); 
                }
            })
        })
        .catch(() => { 
            reject("Unable to find user: " + userData.userName); 
        }) 
    })
};