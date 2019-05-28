const sequelize = require("../../src/db/models/index").sequelize;
const User = require("../../src/db/models").User;
const Wiki = require("../../src/db/models").Wiki;

describe("Wiki", () => {
  beforeEach((done) => {
    this.user;
    this.wiki;

    sequelize.sync({force: true}).then((res) => {
      User.create({
        username: "user01",
        email: "user01@example.com",
        password: "123456"
      })
      .then((user) => {
        this.user = user;

        Wiki.create({
          title: "Cookies",
          body: "Cookies were invented in 1937.",
          userId: this.user.id
        })
        .then((wiki) => {
          this.wiki = wiki;
          done();
        })
        .catch((err) => {
          console.log(err);
          done();
        });
      });
    });
  });

  describe("#create()", () => {
    it("should create a wiki object with title, body and assigned user", (done) => {
      Wiki.create({
        title: "Dogs",
        body: "There are over 300 breeds.",
        userId: this.user.id
      })
      .then((wiki) => {
        expect(wiki.title).toBe("Dogs");
        expect(wiki.body).toBe("There are over 300 breeds.");
        done();
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });

    it("should not create a wiki object with missing title or body", (done) => {
      Wiki.create({
        title: "Cats"
      })
      .then((wiki) => {
        //should not execute
        done();
      })
      .catch((err) => {
        expect(err.message).toContain("Wiki.body cannot be null");
        done();
      });
    });
  });

  describe("#setUser()", () => {
    it("should associate a wiki and a user together", (done) => {
      User.create({
        username: "ExampleUser",
        email: "example@example.com",
        password: "123456"
      })
      .then((newUser) => {
        expect(this.wiki.userId).toBe(this.user.id);
        this.wiki.setUser(newUser)
        .then((wiki) => {
          expect(this.wiki.userId).toBe(newUser.id);
          done();
        });
      });
    });
  });

  describe("#getUser()", () => {
    it("should return the associated user", (done) => {
      this.wiki.getUser()
      .then((associatedUser) => {
        expect(associatedUser.email).toBe("user01@example.com");
        done();
      });
    });
  });
});
