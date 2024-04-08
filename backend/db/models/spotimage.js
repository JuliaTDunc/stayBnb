'use strict';
const {
  Model
} = require('sequelize');
//const {Spot} = require('../models');
module.exports = (sequelize, DataTypes) => {
  class spotImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      spotImage.belongsTo(models.Spot, { foreignKey: 'spot_id' })
    }
  }
  spotImage.init({
    spot_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Spot',
        key: 'id'
      }
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    preview: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'spotImage',
  });
  return spotImage;
};