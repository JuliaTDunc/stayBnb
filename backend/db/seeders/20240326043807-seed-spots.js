'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    

      await queryInterface.bulkInsert('Spots', [{
        address: '123 Apple St.',
        city:'Yakima',
        state:'WA',
        country:'USA',
        lat:'46.6021° N',
        lng:'120.5059° W',
        name:'The Apple House',
        description:'small 2 bedroom apple house',
        price:150,
        preview_image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSV3NCoiLwmh0s5NQFtQDnZ4-1JnAVnziJnNyQT8waGyCy3L6pN9SgP0tcvDyzqOQa6MpQ&usqp=CAU'
      },
    {
      address:'456 Cherry Lane',
      city:'Walla Walla',
      state:'WA',
      country:'USA',
      lat:'46.0646° N',
      lng:'118.3430° W',
      name:'Cherry Cottage',
      description:'3bd 2bth cottage',
      price:250,
      preview_image:'https://northernarizonacabinrentals.com/wp-content/uploads/2021/06/1-no-phone.jpg',
    },
        {
          address:'789 Greenwood St',
          city:'Puyallup',
          state:'WA',
          country:'USA',
          lat:'47.1854° N',
          lng:'122.2929° W',
          name:'The Greenwood House',
          description:'large 4bd 3bth oak house',
          price:275,
          preview_image:'https://cdn.shopify.com/s/files/1/1624/7461/files/Log-Home-Pros-and-cons_600x600.jpg?v=1643646621',
}
], {});
  
  },

  async down (queryInterface, Sequelize) {
    
     await queryInterface.bulkDelete('Spots', null, {});
     
  }
};
