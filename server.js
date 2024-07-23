const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const path = require('path');

// Multer for file uploads
const multer = require('multer');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Static files
app.set('views', path.join(__dirname, 'views'));
app.use('/CSS', express.static(path.join(__dirname, 'public/CSS')));
// app.use('/CSS', express.static(path.join(__dirname, 'public/CSS')));



// Global variable to store user data
const users = {};

// Routes
app.get('/', (req, res) => {
    res.render('signup');
});

app.post('/signup', (req, res) => {
    const { username, password, email } = req.body;
    if (users[username]) {
        res.send('Username already exists.');
    } else {
        users[username] = { password, email };
        res.redirect('/login');
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (users[username] && users[username].password === password) {
        res.redirect('/dashboard');
    } else {
        res.send('Invalid username or password.');
    }
});

app.get('/success', (req, res) => {
    res.render('success');
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

// Voter Registration Form Rendering Route
app.get('/Voter_registration', (req, res) => {
    res.render('Voter_registration');
});

// Voter Registration Form Submission Route
app.post('/voter_registration', (req, res) => {
    const { firstName, middleName, lastName } = req.body;
    const insertUserQuery = `
    INSERT INTO users (First_Name, Middle_Name, Last_Name)
    VALUES (?, ?, ?)`;

    db.run(insertUserQuery, [firstName, middleName, lastName], (err) => {
        if (err) {
            console.error(err.message);
            res.send('Error during registration.');
        } else {
            res.redirect('/success');
        }
    });
});

// Creating route for Parties Registration
app.get('/Party_registration', (req, res) => {
    res.render('Party_registration');
});

// Party Registration Form Submission Route
app.post('/party_registration', (req, res) => {
    const { party, logo } = req.body; // Assuming 'logo' is a URL or base64 string
    const insertPartyQuery = `
    INSERT INTO Parties (Party, Logo)
    VALUES (?, ?)`;

    db.run(insertPartyQuery, [party, logo], (err) => {
        if (err) {
            console.error(err.message);
            res.send('Error during party registration.');
        } else {
            res.redirect('/success');
        }
    });
});

// Candidate Registration Form Rendering Route
app.get('/Candidate_registration', (req, res) => {
    res.render('Candidate_registration');
});

// Candidate Registration Form Submission Route
app.post('/candidate_registration', (req, res) => {
    const { firstName, middleName, lastName, positionId, partyId, photo } = req.body; // Assuming 'photo' is a URL or base64 string
    const insertCandidateQuery = `
    INSERT INTO Candidates (First_Name, Middle_Name, Last_Name, Position_Id, Party_Id, Photo)
    VALUES (?, ?, ?, ?, ?, ?)`;

    db.run(insertCandidateQuery, [firstName, middleName, lastName, positionId, partyId, photo], (err) => {
        if (err) {
            console.error(err.message);
            res.send('Error during candidate registration.');
        } else {
            res.redirect('/success');
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Database creation with SQLITE3 FILES
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./election.db');

// This is the users Table
db.serialize(() => {
    const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
Id INTEGER PRIMARY KEY AUTOINCREMENT,
First_Name TEXT NOT NULL,
Middle_Name TEXT NOT NULL,
Last_Name TEXT NOT NULL,
DOB,
PhotoBLOB)`;

    // Running the SQL Statement
    db.run(createUsersTable, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Users table created successfully.');
        }
    });
});

// // Inserting Data into the Users Table
// let stmt = db.prepare('INSERT INTO users (First_Name, Middle_Name, Last_Name) VALUES (?, ?, ?)');
// stmt.run('Jame', 'Anointed', 'Morgan');
// stmt.run('Stephen', 'Professor', 'Godwin');
// stmt.run('Gabriel', 'Akoi', 'Smith');
// stmt.finalize();

// // Querying the Data
// db.each(`SELECT Id, First_Name, Middle_Name, Last_Name FROM users`, (err, row) => {
//     if (err) {
//         console.error(err.message);
//     }
//     console.log(row.Id + "\t" + row.First_Name + "\t" + row.Middle_Name + "\t" + row.Last_Name);
// });

// Creating the roles Table
db.serialize(() => {
    const createRolesTable = `
CREATE TABLE IF NOT EXISTS roles (
Id INTEGER PRIMARY KEY AUTOINCREMENT,
Role_Name TEXT NOT NULL)`;

    // Running the SQL Statement
    db.run(createRolesTable, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Roles table created successfully.');
        }
    });
});

// Creating the Parties Table
db.serialize(() => {
    const createPartiesTable = `
    CREATE TABLE IF NOT EXISTS Parties (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Party TEXT NOT NULL,
    Logo BLOB)`;

    // Running the SQL Statement
    db.run(createPartiesTable, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Parties table created successfully.');
        }
    });
});

// Creating the Candidates Table
db.serialize(() => {
    const createCandidatesTable = `
    CREATE TABLE IF NOT EXISTS Candidates (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    First_Name TEXT NOT NULL,
    Middle_Name TEXT NULL,
    Last_Name TEXT NOT NULL,
    Position_Id INTEGER,
    Party_Id INTEGER,
    Photo BLOB)`;

    // Running the SQL Statement
    db.run(createCandidatesTable, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Candidates table created successfully.');
        }
    });
});

// Creating the Votes Table
db.serialize(() => {
    const createVotesTable = `
    CREATE TABLE IF NOT EXISTS Votes (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Candidate_Id INTEGER,
    Vote INTEGER)`;

    // Running the SQL Statement
    db.run(createVotesTable, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Votes table created successfully.');
        }
    });
});

// Creating the Positions Table
db.serialize(() => {
    const createPositionsTable = `
    CREATE TABLE IF NOT EXISTS Positions (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Position TEXT NOT NULL)`;

    // Running the SQL Statement
    db.run(createPositionsTable, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Positions table created successfully.');
        }
    });
});
