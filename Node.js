const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'priyanka@123',
  database: 'trip',
});

connection.connect((err) => {
  if (err) {
    console.error('Database connection failed: ', err);
  } else {
    console.log('Connected to the database');
  }
});


app.get('/api/userDetails/:userId', (req, res) => {
  const userId = req.params.userId;

  connection.query(
    'SELECT id, username, mobileNumber FROM user WHERE id = ?',
    [userId],
    (err, results) => {
      if (err) {
        console.error('Error fetching user details:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (results.length === 0) {
        console.log('User not found');
        return res.status(404).json({ error: 'User not found' });
      }

      const userDetails = results[0];
      res.status(200).json(userDetails);
    }
  );
});


app.post('/api/register', (req, res) => {
  console.log('Received registration request:', req.body);
  
  const { username, password, mobileNumber, adharCard, licenseNumber } = req.body;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    connection.query(
      'INSERT INTO user (username, password, mobileNumber, adharCard, licenseNumber) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, mobileNumber, adharCard, licenseNumber],
      (err, results) => {
        if (err) {
          console.error('Error registering user:', err);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }

        const userId = results.insertId;
        console.log('User registered successfully. UserID:', userId);

        res.status(200).json({ userId, username });
      }
    );
  });
});


app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Received login request with username:', username);

  connection.query(
    'SELECT * FROM user WHERE username = ?',
    [username],
    (err, results) => {
      if (err) {
        console.error('Error querying database:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      console.log('Query results:', results);

      if (results.length === 0) {
       
        console.log('Username not found');
        return res.status(400).json({ error: 'Username or password is incorrect' });
      }

      const user = results[0];
     
      bcrypt.compare(password, user.password, (bcryptErr, bcryptResult) => {
        if (bcryptErr) {
          console.error('Error comparing passwords:', bcryptErr);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (bcryptResult) {
          
          console.log('Login successful');
          return res.status(200).json({ userId: user.id, username: user.username });
        } else {
          
          console.log('Incorrect password');
          return res.status(400).json({ error: 'Username or password is incorrect' });
        }
      });
    }
  );
});


app.get('/api/trip', (req, res) => {
  const userId = req.query.userId; 
  connection.query(
    `SELECT t.*, IFNULL(jt.status, 'Not Joined') AS status
     FROM trip t
     LEFT JOIN joined_trips jt ON t.TRIPID = jt.tripId AND jt.userId = ?`,
    [userId],
    (error, results) => {
      if (error) {
        console.error('Error fetching trips:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
      res.json(results);
    }
  );
});



app.post('/api/trip', (req, res) => {
  const { destination, id, travellerName, startDate, endDate, duration, noofseats } = req.body;

  if (!destination || !id || !travellerName || !startDate || !endDate || !duration || !noofseats) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Insert the trip data into the database
  connection.query(
    'INSERT INTO trip (DESTINATION, id, TRAVELLERNAME, STARTDATE, ENDDATE, DURATION, NOOFSEATS) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [destination, id, travellerName, startDate, endDate, duration, noofseats],
    (err, result) => {
      if (err) {
        console.error('Error creating trip:', err);
        return res.status(500).json({ error: 'Failed to create trip' });
      }
      const tripId = result.insertId;
      console.log('Trip created successfully. TripID:', tripId);

      
      

      res.status(201).json({ tripId });
    }
  );
});


app.get('/api/tripDetails/:tripId', (req, res) => {
  const tripId = parseInt(req.params.tripId);
  connection.query(
    'SELECT STARTDATE FROM trip WHERE TRIPID = ?',
    [tripId],
    (error, results) => {
      if (error) {
        console.error('Error fetching trip details:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
      if (results.length === 0) {
        res.status(404).json({ error: 'Trip not found' });
        return;
      }
      const tripDetails = results[0];
      res.json(tripDetails);
    }
  );
});

// Join a trip
app.post('/api/joinTrip/:tripId', (req, res) => {
  const tripId = parseInt(req.params.tripId);
  const userId = req.body.userId; 

  console.log('Received request to join trip. Trip ID:', tripId, 'User ID:', userId);

  if (isNaN(tripId) || tripId <= 0 || !userId) {
    console.log('Invalid tripId or userId');
    return res.status(400).json({ error: 'Invalid tripId or userId' });
  }


  connection.query(
    'INSERT INTO joined_trips (tripId, userId, status) VALUES (?, ?, ?)',
    [tripId, userId, 'Joined'],
    (err, result) => {
      if (err) {
        console.error('Error joining trip:', err);
        return res.status(500).json({ error: 'Failed to join the trip' });
      }
      console.log('Successfully joined the trip');
      res.status(200).json({ message: 'Joined trip successfully' });
    }
  );

 
  connection.query(
    'UPDATE trip SET NOOFSEATS = NOOFSEATS - 1 WHERE TRIPID = ?',
    [tripId],
    (err, result) => {
      if (err) {
        console.error('Error updating number of seats:', err);
        res.status(500).json({ error: 'Failed to join the trip' });
        return;
      }
    }
  ); 
});

// Cancel a trip
app.post('/api/cancelTrip/:tripId', (req, res) => {
  const tripId = parseInt(req.params.tripId);
  const userId = req.body.userId; 

  console.log('Received request to cancel trip. Trip ID:', tripId, 'User ID:', userId);

  if (isNaN(tripId) || tripId <= 0 || !userId) {
    console.log('Invalid tripId or userId');
    return res.status(400).json({ error: 'Invalid tripId or userId' });
  }

 
  connection.query(
    'UPDATE joined_trips SET status = "Cancelled" WHERE tripId = ? AND userId = ?',
    [tripId, userId],
    (err, result) => {
      if (err) {
        console.error('Error updating trip status:', err);
        return res.status(500).json({ error: 'Failed to cancel the trip' });
      }

      
      connection.query(
        'UPDATE trip SET NOOFSEATS = NOOFSEATS + 1 WHERE TRIPID = ?',
        [tripId],
        (err, result) => {
          if (err) {
            console.error('Error updating number of seats:', err);
            return res.status(500).json({ error: 'Failed to cancel the trip' });
          }
          console.log('Successfully canceled the trip');
          res.status(200).json({ message: 'Canceled trip successfully' });
        }
      );
    }
  );
});

  app.get('/api/notifications/:userId', (req, res) => {
    const userId = req.params.userId;
  
    
connection.query(
  `SELECT 
    CASE 
      WHEN jt.status = 'Joined' THEN CONCAT("User id ", jt.userid, " joined your trip") 
      WHEN jt.status = 'Cancelled' THEN CONCAT("User id ", jt.userid, " cancelled your trip") 
    END AS message,
    trip.DESTINATION,
    trip.id AS creator_id,
    trip.TRIPID AS trip_id
  FROM joined_trips jt
  JOIN trip ON jt.tripid = trip.TRIPID
  WHERE trip.id = ?`,
  [userId],
  (err, results) => {
    if (err) {
      console.error('Error fetching notifications:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.status(200).json(results);
  }
);

  });

app.get('/logout', (req, res) => {
  
  res.redirect('/login');
});



app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});




app.listen(port, () => {
  console.log(`Server is running on port ${port}`);

});
