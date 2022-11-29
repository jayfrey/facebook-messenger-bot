const mailgun = require("mailgun-js");
const mailgunConfig = require("../configs/mailgun");

module.exports = class Mailer {
  constructor() {
    this.mailer = mailgun({
      apiKey: mailgunConfig.apiKey,
      domain: mailgunConfig.domain,
    });
  }

  send(content) {
    this.mailer.messages().send(
      {
        from: content.from,
        to: content.to,
        subject: content.subject,
        template: content.template,
        "h:X-Mailgun-Variables": content.variables,
      },
      function (error, body) {
        console.log(body);
      }
    );
  }
};
