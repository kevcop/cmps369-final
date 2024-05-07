//neccessary modules
require('dotenv').config();
const pug = require('pug');
const express = require('express');
const http = require('http');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const session = require('express-session');

app.use(express.static('public'));
// This enabled a request body parser for form
// data.  It works a lot like our BodyParser
app.use(express.urlencoded({ extended: true }))
// Express will assume your pug templates are
// in the /views directory
app.set('view engine', 'pug');
app.use(bodyParser.json());

console.log(process.env.DBPATH);

// Database setup is the same as before
const Database = require('./db');
const db = new Database();
db.initialize();

//create sql tables and have the ID as the primary key
/* const startup = async () => {

    await db.schema('Contacts', [
        { name: 'ID', type: 'INTEGER' },
        { name: 'FirstName', type: 'TEXT'},
        { name: 'LastName', type: 'TEXT' },
        { name: 'Address', type: 'TEXT'},
        { name: 'Phone', type: 'TEXT' },
        { name: 'Email', type: 'TEXT' },
        { name: 'Greeting', type: 'TEXT'},
        { name: 'Contact_By_Email', type: 'INTEGER'},
        { name: 'Contact_By_Phone', type: 'INTEGER'},
        { name: 'Contact_By_Mail', type: 'INTEGER'},
        {name: 'Latitude', type: 'REAL'},
        {name: 'Longitude', type: 'REAL'}
    ], 'ID');

    await db.schema('Users', [
        { name: 'ID', type: 'INTEGER' },
        { name: 'FirstName', type: 'TEXT' },
        { name: 'LastName', type: 'TEXT' },
        { name: 'Username', type: 'TEXT' },
        { name: 'Password', type: 'TEXT'},
    ], 'ID')

 } */

//startup();

//attempt to connect to db
app.use(async (req, res, next) => {
    try {
      if (!db.db) {
        await db.connect();
      }
      req.db = db;
      next();
    } catch (error) {
      next(error); 
    }
  });

  app.use((req, res, next) => {
    req.findUserByUsername = async function(username) {
        try {
            const sql = `SELECT * FROM Users WHERE Username = ?`;
            return await req.db.get(sql, [username]);
        } catch (error) {
            console.error("Error finding user by username:", error);
            return undefined;
        }
    };
    next();
  });
  //session initializer
  app.use(session({
    secret: 'cmps369',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

app.use((req, res, next) => {
    if (req.session.user) {
        res.locals.user = {
            id: req.session.user.id,
            email: req.session.user.email
        }
    }
    next()
})

//declaring use of pug
app.set('view engine', 'pug');

//integrating routes from routes folder


app.use('/', require('./routes/contacts')); 

app.use('/', (req, res) => {
  res.render('home', {});
})
app.use('/', require('./routes/login')); 
app.use('/', require('./routes/users')); 

app.use('/contacts', require('./routes/contacts'));

//start app on port 8080
  app.listen(8080, () => {
    console.log(`Listening on port 8080`)
})