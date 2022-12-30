// import important parts of sequelize library
const { Model, DataTypes } = require('sequelize');
// import our database connection from config.js
const sequelize = require('../config/connection');

// Initialize Product model (table) by extending off Sequelize's Model class
class Product extends Model {}

// set up fields and rules for Product model
Product.init(
  {
    // define columns
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },

    product_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    price: {
      type: DataTypes.DECIMAL(15, 2),
      validate: { isDecimal: true },
      allowNull: false
    },

    stock: {
      type: DataTypes.INTEGER,
      validate: { isNumeric: true },
      defaultValue: 10,
      allowNull: false
    },

    category_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'category',
        key: 'id',
      },
    }
    
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'product',
  }
);

module.exports = Product;
