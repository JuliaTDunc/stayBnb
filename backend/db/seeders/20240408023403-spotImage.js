'use strict';
const {SpotImage} = require('../models/')
/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
module.exports = {
  async up (queryInterface, Sequelize) {
    await SpotImage.bulkCreate([
      {
        spot_id: 1,
        url: 'imagefirstspot.com',
        previewImage: true
      },
      {
        spot_id: 2,
        url: 'imagesecondspot.com',
        previewImage: true
      },
      {
        spot_id: 3,
        url: 'imagesthirdspot.com',
        previewImage: true
      },
    ], { validate: true, returning: false });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options.tableName, {
      spot_id: { [Op.in]: [1, 2, 3] }
    }, {});
  }
};
