//necessary modules
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

//router for handling login page
router.get('/login', (req, res) => {
    res.render('login'); //display the page using the login pug file
  });

//router for handling a users attempt to login
router.post('/login', async (req, res) => {
    //extract username and password
    const { username, password } = req.body;
    try {
        //declare a user variable which will store all the information of the found username
        const user = await req.db.findUserByUsername(username);

        //check if the entered password matches up to the password we have in the database
        if (bcrypt.compareSync(password, user.Password)) {
  
            //init session with the user 
            req.session.user = user;
            //redirect a logged in user to the home page
            return res.redirect('/');
        } else {
            //render an error message if the password does not match
            return res.render('login', { errorMessage: 'Invalid credentials' });
        }
    } catch (error) {
        //render a error message if the username does not exist in the database 
        return res.render('login', { errorMessage: 'Invalid credentials' });
    }
});

  



// GET route for the logout action
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});



module.exports = router;
