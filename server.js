//jshint eversion:6
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const path = require('path');
const bcrypt = require('bcrypt'); // Import bcrypt
const multer = require('multer'); // Multer for file uploads
const upload = multer(); // Initialize multer without storage configuration for in-memory storage
const sqlite3 = require('sqlite3').verbose();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Static files
app.set('views', path.join(__dirname, 'views'));
app.use('/CSS', express.static(path.join(__dirname, 'public/CSS')));
app.use('/Images', express.static(path.join(__dirname, 'public/Images')));
app.use('/JS', express.static(path.join(__dirname, 'public/JS')));
// Connecting The SQLITE Database
const db = new sqlite3.Database('./election.db');

// Create tables if they don't exist
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS auth (id INTEGER PRIMARY KEY AUTOINCREMENT, Username TEXT, Password TEXT, Email TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, First_Name TEXT, Middle_Name TEXT, Last_Name TEXT, County TEXT, DOB TEXT, Photo BLOB)");
    db.run("CREATE TABLE IF NOT EXISTS parties (id INTEGER PRIMARY KEY AUTOINCREMENT, Party_Name TEXT, Party_Logo BLOB)");
    db.run("CREATE TABLE IF NOT EXISTS candidates (id INTEGER PRIMARY KEY AUTOINCREMENT, First_Name TEXT, Middle_Name TEXT, Last_Name TEXT, Position_Id INTEGER, Party_Id INTEGER, Photo BLOB)");
    db.run("CREATE TABLE IF NOT EXISTS contactUs (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, message TEXT)");
});

// Routes

// Signup
app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post("/signup", (req, res) => {
    const { username, password, email } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.get("SELECT email FROM auth WHERE email = ?", [email], (err, row) => {
        if (err) {
            console.error(err.message);
            res.send("Error checking email");
        } else if (row) {
            res.render("email-error-message");
        } else {
            db.run(
                "INSERT INTO auth (Username, Password, Email) VALUES (?, ?, ?)",
                [username, hashedPassword, email],
                (err) => {
                    if (err) {
                        console.error(err.message);
                        res.send("Error saving data");
                    } else {
                        res.render("login");
                    }
                }
            );
        }
    });
});

// Login
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT * FROM auth WHERE Username = ?", [username], (err, row) => {
        if (err) {
            console.error(err.message);
            res.send("Error checking username");
        } else if (!row) {
            res.render("login-error-message");
        } else {
            const match = bcrypt.compareSync(password, row.Password);
            if (match) {
                res.render("dashboard");
            } else {
                res.render("Wrong_password");
            }
        }
    });
});

// Voter Registration
app.get('/Voter_registration', (req, res) => {
    db.all("SELECT * FROM roles", (err, rows) => {
        res.render('Voter_registration', { roles: rows });
    });
});

app.post('/Voter_registration', upload.single('photo'), (req, res) => {
    const { firstname, middlename, lastname, county, dob } = req.body;
    const photo = req.file ? req.file.buffer : null;

    db.run("INSERT INTO users (First_Name, Middle_Name, Last_Name, County, DOB, Photo) VALUES (?, ?, ?, ?, ?, ?)", [firstname, middlename, lastname, county, dob, photo], (err) => {
        if (err) {
            console.error(err.message);
            res.send("Error saving data");
        } else {
            res.render("newDashboard");
        }
    });
});

// Party Registration
app.get('/Party_registration', (req, res) => {
    res.render('Party_registration');
});

app.post('/Party_registration', upload.single('partylogo'), (req, res) => {
    const { partyname } = req.body;
    const partylogo = req.file ? req.file.buffer : null;

    db.run("INSERT INTO parties (Party_Name, Party_Logo) VALUES (?, ?)", [partyname, partylogo], (err) => {
        if (err) {
            console.error(err.message);
            res.send("Error saving data");
        } else {
            res.render('complete_registration');
        }
    });
});

// Candidate Registration
app.get('/candidate', (req, res) => {
    res.render('candidate');
});

app.post('/candidate', upload.single('photo'), (req, res) => {
    const { firstname, middlename, lastname, positionid, partyid } = req.body;
    const photo = req.file ? req.file.buffer : null;

    db.run("INSERT INTO candidates (First_Name, Middle_Name, Last_Name, Position_Id, Party_Id, Photo) VALUES (?, ?, ?, ?, ?, ?)", [firstname, middlename, lastname, positionid, partyid, photo], (err) => {
        if (err) {
            console.error(err.message);
            res.send("Error saving data");
        } else {
            res.render("complete_registration");
        }
    });
});

// Contact Us
app.get('/contactUs', (req, res) => {
    res.render("contactUs");
});

app.post('/contactUs', (req, res) => {
    const { name, email, message } = req.body;

    db.run("INSERT INTO contactUs (name, email, message) VALUES (?, ?, ?)", [name, email, message], (err) => {
        if (err) {
            console.error(err.message);
            res.send("Error saving data");
        } else {
            res.render("Feedback");
        }
    });
});

// API to get total number of registered voters
app.get('/api/total-registered-voters', (req, res) => {
    db.get("SELECT COUNT(*) AS totalVoters FROM users", (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Failed to fetch total registered voters' });
        } else {
            res.json({ totalVoters: row.totalVoters });
        }
    });
});

// Dashboard
app.get('/newDashboard', (req, res) => {
    res.render('newDashboard');
});

// Other Routes
app.get('/home', (req, res) => {
    res.render('home');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/Wrong_password', (req, res) => {
    res.render('wrong_password');
});

app.get('/complete_registration', (req, res) => {
    res.render('complete_registration');
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard');
})

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
