-This repository is respond for an executable microservice that will take user information(username,password and email) inside an HTTP request then store in a third party MongoDB API, and return the user data back to server.

-This microservice will run on localhost with select port (default on port 8080). To run the program, you need to install express on your computer, type:

npm install express and npm init to install them. You will also need to install Node.js. You can download the correct version from their website.

REQUEST
-------------------
-To use the this service, you need to run the server first(node server.js or npm start), and sent a get request by simply click the register button.
-Or if using for another language, you must create a class for register. Then adjust the following function accordingly to specific language syntax requirement:

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



Example: 
![image](https://user-images.githubusercontent.com/55546624/181372913-6c0bc111-9ed2-4bd9-bc74-eb75c39e4637.png)


-The service will receive the data by simply click to the login page. 
-Or if using for another language, you must create a class for register. Then adjust the following function accordingly to specific language syntax requirement:

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

Example:
![image](https://user-images.githubusercontent.com/55546624/181373045-cd714d57-f83e-47cd-b98d-8b82031fc089.png)


UML diagram
![uml](https://user-images.githubusercontent.com/55546624/182706540-3a61428d-6471-4f43-9cb4-f8476beab50f.jpg)

