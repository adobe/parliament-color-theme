"use strict";

require("dotenv").config();
const fs = require("fs");
const fetch = require("node-fetch");
const { URLSearchParams } = require("url");
const { v4: uuidv4 } = require("uuid");
const parseLinkHeaders = require("parse-link-header");
const uriTemplateParser = require("uri-template");

const defaultHeaders = {
  "Cache-Control": "no-cache",
  "x-Api-key": process.env.CLIENT_ID,
};
async function fetchFromTemplateUri(uri, options, values = {}) {
  const tpl = uriTemplateParser.parse(uri);
  const url = tpl.expand(values);
  return await fetch(url, options);
}
//  Authenticate: Get Bearer Token
async function authenticate() {
  // Default auth parameters
  const defaultRequestOptions = {
    method: "POST",
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    redirect: "follow",
  };
  // User parameters
  const userParams = new URLSearchParams();
  userParams.append("grant_type", "password");
  userParams.append("client_id", process.env.CLIENT_ID);
  userParams.append("client_secret", process.env.CLIENT_SECRET);
  userParams.append("username", process.env.USERNAME);
  userParams.append("password", process.env.PASSWORD);
  userParams.append("scope", "AdobeID,openid");
  userParams.append("response_type", "token");
  const userOptions = { body: userParams, ...defaultRequestOptions };
  // Get user token
  let response = await fetch(
    `https://ims-na1-stg1.adobelogin.com/ims/token/v2`,
    userOptions
  );
  let token = await response.json();
  // Bearer parameters
  const bearerParams = new URLSearchParams();
  bearerParams.append("grant_type", "cluster_at_exchange");
  bearerParams.append("client_id", process.env.CLIENT_ID);
  bearerParams.append("client_secret", process.env.CLIENT_SECRET);
  bearerParams.append("user_id", process.env.USER_ID);
  bearerParams.append("user_token", token.access_token);
  const bearerOptions = { body: bearerParams, ...defaultRequestOptions };
  // Get bearer token
  response = await fetch(
    `https://ims-na1-stg1.adobelogin.com/ims/token/v2`,
    bearerOptions
  );
  token = await response.json();
  return token.access_token;
}
async function interrogatePlatform() {
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/vnd.adobecloud.directory+json",
      ...defaultHeaders,
    },
    redirect: "follow",
  };
  let response = await fetch(
    `https://platform-cs-stage.adobe.io`,
    requestOptions
  );
  let { children } = await response.json();
  let repo = children.find((child) => child["repo:path"] === "/Assets.json");
  let page_link = repo._links["http://ns.adobe.com/adobecloud/rel/page"].href;
  return page_link;
}
// Discover Root Repository
async function discoverRootRepository(assets_page_link) {
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/vnd.adobecloud.directory+json",
      ...defaultHeaders,
    },
    redirect: "follow",
  };
  let response = await fetchFromTemplateUri(assets_page_link, requestOptions, {
    limit: 10,
  });
  let data = await response.json();
  return data._links["http://ns.adobe.com/adobecloud/rel/resolve/path"].href;
}

class Sale {
  // constructor
  constructor(price) {
    [this.decoratorsList, this.price] = [[], price];
  }

  decorate(decorator) {
    if (!Sale[decorator]) throw new Error(`decorator not exist: ${decorator}`);
    this.decoratorsList.push(Sale[decorator]);
  }

  getPrice() {
    for (let decorator of this.decoratorsList) {
      this.price = decorator(this.price);
    }
    return this.price.toFixed(2);
  }

  static quebec(price) {
    // this is a comment
    return price + (price * 7.5) / 100;
  }

  static fedtax(price) {
    return price + (price * 5) / 100;
  }
}

let sale = new Sale(100);
sale.decorate("fedtax");
sale.decorate("quebec");
console.log(sale.getPrice()); //112.88

getPrice();

//deeply nested

async function asyncCall() {
  var result = await resolveAfter2Seconds();
}

for (let i = 0; i < 10; i++) {
  continue;
}

if (true) {
}

while (true) {}

switch (2) {
  case 2:
    break;
  default:
    break;
}
