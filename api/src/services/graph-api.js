/**
 * Copyright 2021-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Messenger For Original Coast Clothing
 * https://developers.facebook.com/docs/messenger-platform/getting-started/sample-apps/original-coast-clothing
 */

"use strict";

// Imports dependencies
const fbConfig = require("../configs/fb");
const fetch = require("node-fetch");
const { URL, URLSearchParams } = require("url");

module.exports = class GraphApi {
  static async callSendApi(requestBody) {
    let url = new URL(`${fbConfig.apiUrl}/me/messages`);
    url.search = new URLSearchParams({
      access_token: fbConfig.pageAccesToken,
    });
    console.warn("Request body is\n" + JSON.stringify(requestBody));
    let response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      console.warn(
        `Unable to call Send API: ${response.statusText}`,
        await response.json()
      );
    }
  }

  static async getUserProfile(senderIgsid) {
    let url = new URL(`${fbConfig.apiUrl}/${senderIgsid}`);
    url.search = new URLSearchParams({
      access_token: fbConfig.pageAccesToken,
      fields: "first_name, last_name, name, id",
    });
    let response = await fetch(url);
    if (response.ok) {
      let userProfile = await response.json();

      return {
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        name: userProfile.name,
        psid: userProfile.id,
      };
    } else {
      console.warn(
        `Could not load profile for ${senderIgsid}: ${response.statusText}`,
        await response.json()
      );
      return null;
    }
  }

  static async getPageOwnerDetaiils() {
    // Send the HTTP request to get page owner details
    let url = new URL(`${fbConfig.apiUrl}/me`);
    url.search = new URLSearchParams({
      access_token: fbConfig.pageAccesToken,
      fields: "emails",
    });
    let response = await fetch(url);
    if (response.ok) {
      console.log(`Request sent.`);
      return await response.json();
    } else {
      console.warn(
        `Unable to getPageOwnerDetaiils: ${response.statusText}`,
        await response.json()
      );
    }
  }
};
