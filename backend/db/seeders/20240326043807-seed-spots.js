'use strict';
const { Spot } = require("../models");
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
      await Spot.bulkCreate([
        {
        owner_id: 1,
        address: '123 Apple St.',
        city:'Yakima',
        state:'WA',
        country:'USA',
        lat:46.6021,
        lng:120.5059,
        name:'The Apple House',
        description:'small 2 bedroom apple house',
        price:150,
       
      },
    {
      owner_id: 2,
      address:'456 Cherry Lane',
      city:'Walla Walla',
      state:'WA',
      country:'USA',
      lat:46.0646,
      lng:118.3430,
      name:'Cherry Cottage',
      description:'3bd 2bth cottage',
      price:250,
    },
        {
          owner_id: 3,
          address:'789 Greenwood St',
          city:'Puyallup',
          state:'WA',
          country:'USA',
          lat:47.1854,
          lng:122.2929,
          name:'The Greenwood House',
          description:'large 4bd 3bth oak house',
          price:275,
          
}
], {validate: true});
  
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Spots';
    const Op = Sequelize.Op;
     await queryInterface.bulkDelete(options, {
       name: { [Op.in]: ['The Apple House','Cherry Cottage','The Greenwood House'] }
     }, {});
  }
};
