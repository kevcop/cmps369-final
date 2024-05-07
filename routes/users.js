//neccessary modules
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

//router to handle accessing sign up page
router.get('/signup', (req, res) => {
  res.render('signup');
});

//router to handle when a user hits the sign up button
router.post('/signup', async (req, res) => {
    //extract necessary information
    const username = req.body.username.trim();
    const firstName = req.body.firstName.trim();
    const lastName = req.body.lastName.trim();
    const p1 = req.body.password.trim();
    const p2 = req.body.confirmPassword.trim();
    //if the passwords do not match up
    if (p1 !== p2) {
        //render a message indicating that the passwords do not match up
        return res.render('signup', { errorMessage: 'Passwords do not match!' });
    }
    //block a duplicate username
    try {
        const user = await req.findUserByUsername(username); //FUNCTION WAS CREATED IN INDEX OF DBCMPS369 MODULE
        //if username is found to exist already in the database
        if (user) {
            //render a message indicating that the username already exists
            return res.render('signup', { errorMessage: 'This username is already taken!' });
        }
        //password encryption
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(p1, salt);

        //add user info
        await req.db.create('Users', [
            { column: 'FirstName', value: firstName },
            { column: 'LastName', value: lastName },
            { column: 'Username', value: username },
            { column: 'Password', value: hash }
        ]);

        //used for logging in a user right when they create their login
        req.session.user = { username, firstName, lastName };
        //redirect to the home page
        res.redirect('/');
    } catch (error) {
        //error handling
        console.error("Signup error:", error);
    }
});
//export
module.exports = router;


//this is the code used for the findByUserName function:    
// async findUserByUsername(username) {
//         try {
//             const sql = `SELECT * FROM Users WHERE Username = ?`;
//             const user = await this.db.get(sql, [username]);
//             return user;
//         } catch (error) {
//             console.error("Error finding user by username:", error);
//             return undefined;
//         }
//     }
// }