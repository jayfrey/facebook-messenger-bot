module.exports = class RequestSendAPI {
  static requestBody(recipientId, response) {
    let requestBody = {};
    requestBody = {
      recipient: {
        id: recipientId,
      },
      message: response,
    };
    return requestBody;
  }
};
