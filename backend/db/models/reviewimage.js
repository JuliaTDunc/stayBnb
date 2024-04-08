'use strict';
const {
  Model
} = require('sequelize');
//const {Review} = require('../models');
module.exports = (sequelize, DataTypes) => {
  class reviewImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      reviewImage.belongsTo(models.Review, {foreignKey: 'review_id'})
    }
  }
  reviewImage.init({
    review_id:{
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
    modelName: 'reviewImage',
  });
  return reviewImage;
};