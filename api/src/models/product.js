"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Product.init(
    {
      sku: DataTypes.INTEGER,
      name: DataTypes.STRING,
      type: DataTypes.STRING,
      price: DataTypes.FLOAT,
      upc: DataTypes.STRING,
      category: DataTypes.STRING,
      shipping: DataTypes.FLOAT,
      description: DataTypes.STRING,
      manufacturer: DataTypes.STRING,
      model: DataTypes.STRING,
      url: DataTypes.STRING,
      image: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Product",
    }
  );
  return Product;
};
