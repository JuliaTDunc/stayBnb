'use strict';
const {SpotImage} = require('../models/')
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
      await SpotImage.bulkCreate([
        {
          spotId: 1,
          url: 'https://www.creativefabrica.com/wp-content/uploads/2022/09/27/Wes-Anderson-Garden-Architecture-39397614-1.png',
          previewImage: true
        },
        {
          spotId: 2,
          url: 'https://metro.co.uk/wp-content/uploads/2024/05/SEC_203164879-0b12.jpg?quality=90&strip=all&zoom=1&resize=480%2C360',
          previewImage: true
        },
        {
          spotId: 3,
          url: 'https://mir-s3-cdn-cf.behance.net/projects/404/798c04193743989.Y3JvcCwxNDAwLDEwOTUsMCwyMA.png',
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
    options.tableName = 'SpotImage';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options.tableName, {
      spot_id: { [Op.in]: [1, 2, 3] }
    }, {});
  }
};
