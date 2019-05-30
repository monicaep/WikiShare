'use strict';

const faker = require("faker");

let wikis =[];

for(let i = 1; i <= 10; i++) {
  wikis.push({
    title: faker.random.word(),
    body: faker.lorem.sentence(),
    private: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 1
  })
}

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    return queryInterface.bulkInsert("Wikis", wikis, {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
    return quertyInterface.bulkDelete("Wikis", null, {});
  }
};
