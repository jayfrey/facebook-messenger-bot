"use strict";

/** @type {import('sequelize-cli').Migration} */

const fs = require("fs");
const path = require("path");
const db = require("../models/index");

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    let products = fs.readFileSync(
      path.join(__dirname, "..", "data", "products.json"),
      "utf8"
    );
    products = JSON.parse(products.toString());
    Object.keys(products).forEach((key) => {
      products[key].category = JSON.stringify(products[key].category);
      let shipping = products[key].shipping;
      if (typeof shipping === "string" || shipping instanceof String) {
        products[key].shipping = 0;
      }
    });
    await queryInterface.bulkInsert("Products", products, {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("Products", null, {});
  },
};
