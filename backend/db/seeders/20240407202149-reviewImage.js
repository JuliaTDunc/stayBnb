'use strict';
const {reviewImage} = require('../models/');
/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define the schema in options
}

module.exports = {
  async up (queryInterface, Sequelize) {
      await reviewImage.bulkCreate([
        {
        review_id:1,
        url: 'imagefirstreview.com',
        previewImage:true
      },
    {
      review_id:2,
      url: 'imagesecondreview.com',
      previewImage: true
    },
  {
    review_id:3,
    url: 'imagesthirdreview.com',
    previewImage: true
  },
], {validate: true, returning: false});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'reviewImage';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      review_id: {[Op.in]: [1,2,3]}
    }, {});
  }
};
