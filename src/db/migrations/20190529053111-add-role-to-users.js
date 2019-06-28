'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      "Users",
      "role", {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0 // standard = 0; premium = 1; admin = 2
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Users", "role");
  }
};
