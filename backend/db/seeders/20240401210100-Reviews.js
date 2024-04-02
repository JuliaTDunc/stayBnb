'use strict';
const {Review} = require('../models');
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await Review.bulkCreate([
      {
      userId: 1,
      spotId: 2,
      review: 'Cute house, nice size for 2 people',
      stars: 4
    },{
      userId: 2,
      spotId: 3,
      review: 'Nice house for the weekend',
      stars: 3
    },{
      userId: 3,
      spotId: 1,
      review: 'This house is haunted, do not go',
      stars: 2
    }
  ], {});
    
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.bulkDelete('Reviews', null, {}); 
  }
};
