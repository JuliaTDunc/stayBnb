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
          spot_id: 1,
          url: 'imagefirstspot.com',
          preview: true
        },
        {
          spot_id: 2,
          url: 'imagesecondspot.com',
          preview: true
        },
        {
          spot_id: 3,
          url: 'imagesthirdspot.com',
          preview: true
        },
      ], { validate: true, returning: false });

      console.log("Spot images successfully created.");
    } catch (error) {
      console.error("Error occurred during seeding:", error);
    }

    console.log("Seeding process completed.");
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options.tableName, {
      spot_id: { [Op.in]: [1, 2, 3] }
    }, {});
  }
};
