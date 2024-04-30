'use strict';
const {spotImage} = require('../models/')
/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log("Starting seeding process...");

    try {
      console.log("Attempting to bulk create spot images...");
      await spotImage.bulkCreate([
        {
          spotId: 1,
          url: 'imagefirstspot.com',
          previewImage: true
        },
        {
          spotId: 2,
          url: 'imagesecondspot.com',
          previewImage: true
        },
        {
          spotId: 3,
          url: 'imagesthirdspot.com',
          previewImage: true
        },
      ], { validate: true, returning: false });

      console.log("Spot images successfully created.");
    } catch (error) {
      console.error("Error occurred during seeding:", error);
    }

    console.log("Seeding process completed.");
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'spotImage';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options.tableName, {
      spot_id: { [Op.in]: [1, 2, 3] }
    }, {});
  }
};
