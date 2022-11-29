const mailgunConfig = {
  apiKey: process.env.MAILGUN_API_TOKEN,
  domain: process.env.MAILGUN_DOMAIN,
  get defaultEmail() {
    return (
      "Facebook Messenger Bot <facebookmessengerbot@" + this.domain + ".com>"
    );
  },
};

module.exports = mailgunConfig;
