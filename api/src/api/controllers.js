const db = require("../models/index");
const fbConfig = require("../configs/fb");

const RequestSendAPI = require("../services/request-send-api");
const Response = require("../services/response");
const GraphApi = require("../services/graph-api");
const MessengeHandler = require("../services/messenge-handler");

const controllers = {
  index(req, res) {
    db.sequelize
      .authenticate()
      .then(() => {
        console.log("Connection has been established successfully.");
      })
      .catch((error) => {
        console.error("Unable to connect to the database: ", error);
      });

    fbConfig.checkEnvVariables();
    res.send("Hello World " + fbConfig.appId);
  },

  verify_webhook(req, res) {
    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = fbConfig.verifyToken;

    // Parse the query params
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
      // Checks the mode and token sent is correct
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        // Responds with the challenge token from the request
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    }
  },

  handle_webbook(req, res) {
    let body = req.body;
    // Checks this is an event from a page subscription
    if (body.object === "page") {
      // Returns a '200 OK' response to all requests
      res.status(200).send("EVENT_RECEIVED");

      // Iterate over each entry - there may be multiple if batched
      body.entry.forEach(async function (entry) {
        // Iterate over webhook events - there may be multiple
        entry.messaging.forEach(async function (webhookEvent) {
          // Get the sender PSID
          let senderPSID = webhookEvent.sender.id;

          if (senderPSID != null && senderPSID != undefined) {
            const sender = await db.User.findOne({
              where: { psid: senderPSID },
            });

            if (!sender) {
              const userProfile = await GraphApi.getUserProfile(senderPSID);
              if (userProfile) {
                const sender = await db.User.create(userProfile);
                const messengeHandler = new MessengeHandler(sender);

                // Send a greeting messenge
                messengeHandler.sendGreetingMessenge();
              } else {
                console.log("User Profile is null, skip creating user");
              }
            } else {
              const messengeHandler = new MessengeHandler(sender);
              const event = webhookEvent;

              try {
                if (event.message) {
                  const message = event.message;

                  if (message.text) {
                    // Check if text matches the regex pattern
                    const pattern = "^(\\s+|)(/)([a-z]+)(\\s+)([0-9]+)(\\s+|)$";
                    const matcher = new RegExp(pattern);

                    if (matcher.test(message.text)) {
                      const msg = message.text
                        .replace(/\s+/gm, " ")
                        .trim()
                        .split(" ");
                      const query = msg[0].slice(1);
                      const productId = msg[1];

                      if (query == "buy") {
                        // Notify page email to process order
                        messengeHandler.notifyProcessOrder(productId);
                      } else {
                        // Respond to user query
                        messengeHandler.resolveQueryProduct(query, productId);
                      }
                    }
                  }
                }
              } catch (error) {
                console.error(error);
                const requestBody = RequestSendAPI.requestBody(
                  senderPSID,
                  Response.genText(
                    `An error has occured: '${error}'. We have been notified and will fix the issue shortly!`
                  )
                );
                GraphApi.callSendApi(requestBody);
              }
            }
          }
        });
      });
    } else {
      // Returns a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
    }
  },
};

module.exports = controllers;
