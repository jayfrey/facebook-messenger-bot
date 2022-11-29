const db = require("../models/index");
const GraphApi = require("./graph-api");
const RequestSendAPI = require("./request-send-api");
const Response = require("./response");
const Mailer = require("./mailer");
const mailgunConfig = require("../configs/mailgun");
const {
  productAttributesMapping,
} = require("../enums/product-attributes-mapping");
const { greetingMessages } = require("../constants/greeting-messenges");

module.exports = class MessengeHandler {
  constructor(user) {
    this.user = user;
  }

  async notifyProcessOrder(productId) {
    const product = await db.Product.findOne({
      where: {
        sku: productId,
      },
    });

    const pageOwnerDetails = await GraphApi.getPageOwnerDetaiils();

    pageOwnerDetails.emails.forEach((email) => {
      const category = product.category
        .reduce((arr, category) => {
          arr.push(category.name);
          return arr;
        }, [])
        .join(", ");

      let templateVariables = JSON.stringify({
        customer_name: this.user.name,
        product_image: product.image,
        product_name: product.name,
        product_price: product.price,
        product_shipping: product.shipping,
        product_description: product.description,
        product_type: product.type,
        product_category: category,
        product_manufacturer: product.manufacturer,
        product_model: product.model,
      });

      const content = {
        from: mailgunConfig.defaultEmail,
        to: email,
        subject: "Process Customer Order",
        template: "process_order",
        variables: templateVariables,
      };

      const mailer = new Mailer();
      mailer.send(content);
    });
  }

  async resolveQueryProduct(query, productId) {
    let queryAttribute = productAttributesMapping[query];
    if (Object.keys(db.Product.rawAttributes).includes(queryAttribute)) {
      const product = await db.Product.findOne({
        where: {
          sku: productId,
        },
        attributes: [queryAttribute],
        raw: true,
      });

      const requestBody = RequestSendAPI.requestBody(
        this.user.psid,
        Response.genText(product[queryAttribute])
      );
      GraphApi.callSendApi(requestBody);
    }
  }

  sendGreetingMessenge() {
    const greetingMessage =
      greetingMessages[Math.floor(Math.random() * greetingMessages.length)];

    const requestBody = RequestSendAPI.requestBody(
      this.user.psid,
      Response.genText(greetingMessage)
    );
    GraphApi.callSendApi(requestBody);
  }
};
