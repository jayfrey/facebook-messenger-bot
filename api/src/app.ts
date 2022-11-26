import express, { Application, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser'
import config from './services/config'
import mysql from 'mysql2'

import db from 'sequelize';


const app: Application = express();

app.use(bodyParser.json())

app.get('/', (req: Request, res: Response, next: NextFunction) => {
    // var connection = mysql.createConnection({
    //     host: "db",
    //     user: "user",
    //     password: "password",
    // });

    // connection.connect((err) => {
    //     if (err) {
    //         console.log("Error occurred", err);
    //     } else {
    //         console.log("Connected to MySQL Server");
    //     }
    // });

    // sequelize.authenticate().then(() => {
    //     console.log('Connection has been established successfully.');
    // }).catch((error) => {
    //     console.error('Unable to connect to the database: ', error);
    // });
    console.log(config.apiDomain)
    res.send("Hello World " + config.appId);
});

// Creates the endpoint for our webhook 
app.post('/webhook', (req: Request, res: Response) => {

    let body = req.body;
    // res.status(200).send('EVENT_RECEIVED');
    // Checks this is an event from a page subscription
    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function (entry: any) {

            // Gets the message. entry.messaging is an array, but 
            // will only ever contain one message, so we get index 0
            let webhook_event = entry.messaging[0];
            let senderPSID = webhook_event.sender.id;
            console.log(webhook_event);
            console.log(senderPSID);
        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
});

// Adds support for GET requests to our webhook
app.get('/webhook', (req: Request, res: Response) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = config.verifyToken

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});



app.listen(3000, () => {
    console.log("Server listening on port 3000");
});