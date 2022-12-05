const db = require("../models/index");
const GraphApi = require("./graph-api");
const RequestSendAPI = require("./request-send-api");
const Response = require("./response");
const Mailer = require("./mailer");
const mailgunConfig = require("../configs/mailgun");
const {
  productAttributesMapping,
} = require("../enums/product-attributes-mapping");
const { greetingMessages } = require("../constants/greeting-messages");

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

    const category = product.category
      .reduce((arr, category) => {
        arr.push(category.name);
        return arr;
      }, [])
      .join(", ");

    const templateVariables = JSON.stringify({
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

    let content = {
      from: mailgunConfig.defaultEmail,
      subject: "Process Customer Order",
      template: "process_order",
      variables: templateVariables,
    };

    pageOwnerDetails.emails.forEach((email) => {
      content["to"] = email;
      console.log("content: ", content);
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

  sendGreetingMessage() {
    const greetingMessage =
      greetingMessages[Math.floor(Math.random() * greetingMessages.length)];

    const requestBody = RequestSendAPI.requestBody(
      this.user.psid,
      Response.genText(greetingMessage)
    );
    GraphApi.callSendApi(requestBody);
  }
};
