'use strict';
const {
  Model
} = require('sequelize');
const {Review} = require('../models')
//const User = require('../models')
module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Spot.belongsTo(models.User,{foreignKey:'owner_id'});
      Spot.hasMany(models.Review)
    }
  }
  Spot.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    owner_id: {
      type: DataTypes.INTEGER,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lat: {
      type: DataTypes.DECIMAL,
    },
    lng: {
      type: DataTypes.DECIMAL
    },
    name: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    preview_image: {
      type: DataTypes.STRING
    }
  }
  , {
    sequelize,
    modelName: 'Spot',
  });
  return Spot;
};