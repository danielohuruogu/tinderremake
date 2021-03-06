// storing package content in a variable
const express = require('express');
// port required to start up the server
const PORT = 8000;
// to connect to the MongoDB database we started a while ago
const { MongoClient } = require('mongodb');
// to generate an id for a user created
const { v4: uuidv4 } = require('uuid');
// webtokens
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config()

const uri = process.env.URI;

const app = express();
// to deal with cors errors
app.use(cors());
// to get the request
app.use(express.json());

app.get('/', (req, res) => {
    res.json("Hello to my app");
});

app.post('/signup', async (req, res) => {  
    const client = new MongoClient(uri);
    // this will come through the request from the client
    const { email, password } = req.body;

    // generating user id for MongoDB database
    const generatedUserId = uuidv4();
    // hashing the password with 10 salting rounds
    const hashedPassword = await bcrypt.hash(password, 10);

    try // connecting to the database
    {
        await client.connect()
        const database = client.db('app-data');
        const users = database.collection('users');
        // check if the user already exists
        const existingUser = await users.findOne({ email });

        if (existingUser)
        {
            return res.status(409).send('user already exists. please login');
        }

        // to make sure it's consistent in the DB
        const sanitisedEmail = email.toLowerCase();

        const data = {
            user_id: generatedUserId,
            email: sanitisedEmail,
            hashed_password: hashedPassword
        };

        // tell MongoDB to put the data that comes in to the DB
        const insertedUser = await users.insertOne(data);

        // generate a token for the user after having logged in, so they stay logged in
        const token = jwt.sign(insertedUser, sanitisedEmail, {
            expiresIn: 60 * 24,
        });

        // send back a json with the token and user id to the client
        res.status(201).json({ token, userId: generatedUserId })
    } catch (err)
    {
        console.log(err)
    } finally
    {
        await client.close();
    }
});

app.post('/login', async (req, res) => {

    const client = new MongoClient(uri);

    const { email, password } = req.body;

    try
    {
        await client.connect();
        const database = client.db('app-data');
        const users = database.collection('users');

        // find the user by this email address
        const user = await users.findOne({ email });

        // if the user exists and the passwords match
        if (user && ( await bcrypt.compare(password, user.hashed_password) ))
        {
            // generate an auth token
            const token = jwt.sign(user, email, {
                expiresIn: 60 * 24
            });
            // chuck the token back, along with the user id saved on DB
            res.status(201).json({ token, userId: user.user_id });
        }
        res.status(400).send('Invalid credentials');
    } catch (err) {
        console.log(err);

        // the error is just console logged here, but you would ideally want to
        // send this to the frontend, to display it clearly to the user
    } finally {
        await client.close();
    }
});

app.get('/user', async (req, res) => {
    const client = new MongoClient(uri);
    const userId = req.query.userId;

    try
    {
        await client.connect();
        const database = client.db('app-data');
        const users = database.collection('users');

        const query = { user_id: userId };

        const user = await users.findOne(query);
        res.send(user);
    } catch(err)
    {
        console.log(err);
    } finally
    {
        await client.close();
    }
});



// to confirm the connection to the database
app.get('/gendered-users', async (req, res) => {
    // establish connection to MongoDB
    const client = new MongoClient(uri);
    // grab the gender from the request body - the one the current user is interested in
    const gender_interests = req.query.gender;
    try {
        // async function to connect
        await client.connect();
        // grab our database 'app-data'
        const database = client.db('app-data');
        
        // grab the users collection
        const users = database.collection('users');

        // make a query for all users of that gender
        const query = { gender_identity: { $eq: gender_interests } }

        // try to send them into an array
        const foundUsers = await users.find(query).toArray();

        // // send it to the browser connecting
        res.send(foundUsers);
    } catch(err)
    {
        console.log(err);
    } finally
    {
        // at the end after trying, close the connection
        await client.close();
    }
});

app.get('/users', async (req, res) => {
    const client = new MongoClient(uri);
    const userIds = JSON.parse(req.query.userIds);

    try
    {
        await client.connect();
        const database = client.db('app-data');
        const users = database.collection('users');

        const pipeline =
            [
                {
                    '$match': {
                        'user_id': {
                            '$in': userIds
                        }
                    }
                }
            ]
        const foundUsers = await users.aggregate(pipeline).toArray()
        console.log(foundUsers);
        res.send(foundUsers);

    } catch(err) {
        console.log(err);
    } finally {
        await client.close();
    }
});

app.put('/user', async (req, res) => {
    const client = new MongoClient(uri);
    const formData = req.body.formData;

    try
    {
        await client.connect();
        const database = client.db('app-data');
        const users = database.collection('users');

        const query = { user_id: formData.user_id };

        const updateDocument = {
            $set: {
                first_name: formData.first_name,
                dob_day: formData.dob_day,
                dob_month: formData.dob_month,
                dob_year: formData.dob_year,
                show_gender: formData.show_gender,
                gender_identity: formData.gender_identity,
                gender_interest: formData.gender_interest,
                url: formData.url,
                about: formData.about,
                matches: formData.matches
            }
        };

        const insertedUser = await users.updateOne(query, updateDocument);
        res.send(insertedUser);
    }
    catch(err)
    {
        console.log(err);
    }
    finally
    {
        await client.close();
    }
});

app.put('/addmatch', async (req, res) => {
    const client = new MongoClient(uri);
    const { userId, matchedUserId } = req.body

    try {
        await client.connect();
        const database = client.db('app-data');
        const users = database.collection('users');

        // find the id of the 'swiper'
        const query = { user_id: userId }
        // create a PUT body with the 'swiped' in the object
        const updateDocument = {
            // I think this is MongoDB syntax
            $push: { matches: { user_id: matchedUserId } },
        }
        // run the query, use the function to determine what should be updated
        // update 'swiper's object with 'swiped' id
        const user = await users.updateOne(query, updateDocument);
        // send back the 'swiper'
        res.send(user)
    } catch(err)
    {
        console.log =(err)
    } finally
    {
        await client.close();
    }
});

app.get('/messages', async (req, res) => {
    const client = new MongoClient(uri);
    const {userId, correspondingUserId } = req.query;

    try {
        await client.connect();
        const database = client.db('app-data');
        const messages = database.collection('messages');

        const query = {
            from_userId: userId, to_userId: correspondingUserId
        }

        const foundMessages = await messages.find(query).toArray();
        res.send(foundMessages);
    } finally
    {
        await client.close();
    }
})

app.post('/message', async (req, res) => {
    const client = new MongoClient(uri);
    const message = req.body.message;

    try {
        await client.connect();
        const database = client.db('app-data');
        const messages = database.collection('messages');
        const insertedMessage = await messages.insertOne(message);

        res.send(insertedMessage);
    } catch(err)
    {
        console.log(err)
    } finally
    {
        await client.close();
    }

})

app.listen(PORT, () => console.log('Server running on PORT ' + PORT));