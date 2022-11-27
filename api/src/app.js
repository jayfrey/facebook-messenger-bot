const express = require("express");
const bodyParser = require("body-parser");
const fbConfig = require("./configs/fb");
const db = require("./models/index");

const Response = require("./services/response");
const User = require("./services/user");
const GraphApi = require("./services/graph-api");
const Receive = require("./services/receive");
const i18n = require("../i18n.config");

const fs = require("fs");
const path = require("path");

const app = express();
app.use(bodyParser.json());

var users = {};

app.get("/", (req, res, next) => {
  //   fs.readFile(
  //     path.join(__dirname, "data", "products.json"),
  //     function (err, data) {
  //       let products = JSON.parse(data.toString());
  //       Object.keys(products).forEach(function (key) {
  //         products[key].category = JSON.stringify(products[key].category);
  //         let shipping = products[key].shipping;
  //         if (typeof shipping === "string" || shipping instanceof String) {
  //           products[key].shipping = 0;
  //         }
  //       });

  //       db.Product.bulkCreate(products);
  //     }
  //   );
  db.sequelize
    .authenticate()
    .then(() => {
      console.log("Connection has been established successfully.");
    })
    .catch((error) => {
      console.error("Unable to connect to the database: ", error);
    });

  console.log(fbConfig.apiDomain);
  res.send("Hello World " + fbConfig.appId);
});

// Creates the endpoint for our webhook
app.post("/webhook", (req, res) => {
  let body = req.body;
  // Checks this is an event from a page subscription
  if (body.object === "page") {
    // Returns a '200 OK' response to all requests
    res.status(200).send("EVENT_RECEIVED");

    // // Iterates over each entry - there may be multiple if batched
    // body.entry.forEach(async function (entry) {
    //   // Gets the message. entry.messaging is an array, but
    //   // will only ever contain one message, so we get index 0
    //   let webhook_event = entry.messaging[0];
    //   let senderPSID = webhook_event.sender.id;

    //   const isUserExists = await db.User.findOne({
    //     where: { psid: senderPSID },
    //   });

    //   if (isUserExists) {
    //     console.log("User already exists");
    //   } else {
    //     console.log("User does not exists");
    //   }

    //   console.log(webhook_event);
    //   console.log(senderPSID);
    // });

    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(async function (entry) {
      if ("changes" in entry) {
        // Handle Page Changes event
        let receiveMessage = new Receive();
        if (entry.changes[0].field === "feed") {
          let change = entry.changes[0].value;
          switch (change.item) {
            case "post":
              return receiveMessage.handlePrivateReply(
                "post_id",
                change.post_id
              );
            case "comment":
              return receiveMessage.handlePrivateReply(
                "comment_id",
                change.comment_id
              );
            default:
              console.warn("Unsupported feed change type.");
              return;
          }
        }
      }

      // Iterate over webhook events - there may be multiple
      entry.messaging.forEach(async function (webhookEvent) {
        // Discard uninteresting events
        if ("read" in webhookEvent) {
          console.log("Got a read event");
          return;
        } else if ("delivery" in webhookEvent) {
          console.log("Got a delivery event");
          return;
        } else if (webhookEvent.message && webhookEvent.message.is_echo) {
          console.log(
            "Got an echo of our send, mid = " + webhookEvent.message.mid
          );
          return;
        }

        // Get the sender PSID
        let senderPsid = webhookEvent.sender.id;
        // Get the user_ref if from Chat plugin logged in user
        let user_ref = webhookEvent.sender.user_ref;
        // Check if user is guest from Chat plugin guest user
        let guestUser = isGuestUser(webhookEvent);

        console.log("guestUser:", guestUser);

        if (senderPsid != null && senderPsid != undefined) {
          const isUserExists = await db.User.findOne({
            where: { psid: senderPsid },
          });

          //   if (!(senderPsid in users)) {
          if (!isUserExists) {
            // if (!guestUser) {
            //   // Make call to UserProfile API only if user is not guest
            //   let user = new User(senderPsid);
            //   GraphApi.getUserProfile(senderPsid)
            //     .then((userProfile) => {
            //       user.setProfile(userProfile);
            //     })
            //     .catch((error) => {
            //       // The profile is unavailable
            //       console.log(JSON.stringify(body));
            //       console.log("Profile is unavailable:", error);
            //     })
            //     .finally(() => {
            //       console.log("locale: " + user.locale);
            //       users[senderPsid] = user;
            //       i18n.setLocale("en_US");
            //       console.log(
            //         "New Profile PSID:",
            //         senderPsid,
            //         "with locale:",
            //         i18n.getLocale()
            //       );
            //       return receiveAndReturn(
            //         users[senderPsid],
            //         webhookEvent,
            //         false
            //       );
            //     });
            // } else {
            //   setDefaultUser(senderPsid);
            //   return receiveAndReturn(users[senderPsid], webhookEvent, false);
            // }

            // let receiveMessage = new Receive(
            //   users[senderPsid],
            //   webhookEvent,
            //   false
            // );
            // return receiveMessage.sendMessage(
            //   // Response.genText(i18n.__("get_started.guidance")),
            //   Response.genText("You are new"),
            //   false
            // );

            GraphApi.getUserProfile(senderPsid)
              .then(async (userProfile) => {
                // user.setProfile(userProfile);
                console.log("userProfile:", userProfile);
                // Create a new user
                const newUser = await db.User.create(userProfile);
                console.log("newUser's auto-generated ID:", newUser.id);
              })
              .catch((error) => {
                // The profile is unavailable
                console.log(JSON.stringify(body));
                console.log("Profile is unavailable:", error);
              })
              .finally(() => {
                // console.log("locale: " + user.locale);
                // users[senderPsid] = user;
                // i18n.setLocale("en_US");
                // console.log(
                //   "New Profile PSID:",
                //   senderPsid,
                //   "with locale:",
                //   i18n.getLocale()
                // );
                // return receiveAndReturn(users[senderPsid], webhookEvent, false);

                const greetingMessages = [
                  "How are you?",
                  "I hope you're doing well.",
                  "I hope you're having a great day.",
                ];

                const greetingMessage =
                  greetingMessages[
                    Math.floor(Math.random() * greetingMessages.length)
                  ];

                let requestBody = {};
                requestBody = {
                  recipient: {
                    id: senderPsid,
                  },
                  message: Response.genText(greetingMessage),
                };
                GraphApi.callSendApi(requestBody);
                // setTimeout(() => GraphApi.callSendApi(requestBody), 0);
              });
          } else {
            // i18n.setLocale(users[senderPsid].locale);
            // console.log(
            //   "Profile already exists PSID:",
            //   senderPsid,
            //   "with locale:",
            //   i18n.getLocale()
            // );
            // return receiveAndReturn(users[senderPsid], webhookEvent, false);

            // let receiveMessage = new Receive(
            //   users[senderPsid],
            //   webhookEvent,
            //   false
            // );
            // return receiveMessage.sendMessage(
            //   // Response.genText(i18n.__("get_started.guidance")),
            //   Response.genText("You are not new"),
            //   false
            // );

            let requestBody = {};
            requestBody = {
              recipient: {
                id: senderPsid,
              },
              message: Response.genText("You are not new"),
            };
            GraphApi.callSendApi(requestBody);
            // setTimeout(() => GraphApi.callSendApi(requestBody), 0);
          }
        } else if (user_ref != null && user_ref != undefined) {
          // Handle user_ref
          setDefaultUser(user_ref);
          return receiveAndReturn(users[user_ref], webhookEvent, true);
        }
      });
    });
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Adds support for GET requests to our webhook
app.get("/webhook", (req, res) => {
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
});

function setDefaultUser(id) {
  let user = new User(id);
  users[id] = user;
  i18n.setLocale("en_US");
}

function isGuestUser(webhookEvent) {
  let guestUser = false;
  if ("postback" in webhookEvent) {
    if ("referral" in webhookEvent.postback) {
      if ("is_guest_user" in webhookEvent.postback.referral) {
        guestUser = true;
      }
    }
  }
  return guestUser;
}

function receiveAndReturn(user, webhookEvent, isUserRef) {
  let receiveMessage = new Receive(user, webhookEvent, isUserRef);
  return receiveMessage.sendMessage(
    // Response.genText(i18n.__("get_started.guidance")),
    Response.genText("How are you?"),
    isUserRef
  );
  //   return receiveMessage.handleMessage();
}

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
