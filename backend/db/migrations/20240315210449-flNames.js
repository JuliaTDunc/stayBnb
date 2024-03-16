'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
options.tableName = 'Users'

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(options, 'firstName', {
      allowNull: false,
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn(options, 'lastName', {
      allowNull: false,
      type: Sequelize.STRING,
    }, options);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(options, 'firstName');
    await queryInterface.removeColumn(options, 'lastName');
    
  }    
};
