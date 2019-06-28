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
    return queryInterface.bulkInsert("Wikis", wikis, {});
  },

  down: (queryInterface, Sequelize) => {
    return quertyInterface.bulkDelete("Wikis", null, {});
  }
};
