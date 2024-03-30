'use strict';
const {Booking} = require('../models');



let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
      await Booking.bulkCreate([
        {
        spotId: 1,
        userId: 1,
        startDate: new Date(),
        endDate: new Date(),
      },
      {
        spotId: 2,
        userId: 2,
        startDate: new Date (),
        endDate: new Date(),
      },
      {
        spotId: 3,
        userId: 3,
        startDate: new Date(),
        endDate: new Date(),
      }
    ], {});
    
  },

  async down (queryInterface, Sequelize) {
  
     await queryInterface.bulkDelete('Bookings', null, {});
     
  }
};
