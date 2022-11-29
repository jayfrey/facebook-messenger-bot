const controller = require("./controllers");

module.exports = (app) => {
  app.get("/", controller.index);

  // Creates the endpoint for our webhook
  app.post("/webhook", controller.handle_webbook);

  // Adds support for GET requests to our webhook
  app.get("/webhook", controller.verify_webhook);
};
