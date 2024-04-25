'use strict';
const {ReviewImage} = require('../models/');
/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define the schema in options
}

module.exports = {
 /* async up (queryInterface, Sequelize) {
      await ReviewImage.bulkCreate([
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
  }*/async up(queryInterface, Sequelize) {
    console.log("Starting seeding process for ReviewImages...");

    try {
      console.log("Attempting to bulk create ReviewImages...");
      await ReviewImage.bulkCreate([
        {
          reviewId: 1,
          url: 'imagefirstreview.com',
          previewImage: true
        },
        {
          reviewId: 2,
          url: 'imagesecondreview.com',
          previewImage: true
        },
        {
          reviewId: 3,
          url: 'imagesthirdreview.com',
          previewImage: true
        },
      ], { validate: true, returning: false });

      console.log("ReviewImages successfully created.");
    } catch (error) {
      console.error("Error occurred during seeding ReviewImages:", error);
    }

    console.log("Seeding process for ReviewImages completed.");
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'reviewImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options.tableName, {
      review_id: {[Op.in]: [1,2,3]}
    }, {});
  }
};
