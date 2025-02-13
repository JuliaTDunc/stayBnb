'use strict';
const {
  Model
} = require('sequelize');
//const {Review} = require('../models');
module.exports = (sequelize, DataTypes) => {
  class ReviewImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ReviewImage.belongsTo(models.Review, {foreignKey: 'reviewId'})
    }
  }
  ReviewImage.init({
    reviewId:{
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Review',
        key: 'id'
      }
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    previewImage: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
  }, {
    sequelize,
    modelName: 'ReviewImage',
  });
  return ReviewImage;
};