const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/users/";
const sequelize = require("../../src/db/models/index").sequelize;
const User = require("../../src/db/models").User;

describe("routes : users", () => {
  beforeEach((done) => {
    this.user;
    sequelize.sync({force: true}).then((res) =>{

      User.create({
        username: "exampleUser1",
        email: "exampleUser@example.com",
        password: "123456"
      })
      .then((user) => {
        this.user = user;
        done();
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });
  });

  describe("GET /users/sign_up", () => {
    it("should render a view with a sign up form", (done) => {
      request.get(`${base}sign_up`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("Welcome to Blocipedia")
        done();
      });
    });
  });

  describe("POST /users", () => {
    it("should create a new user with valid values and redirect", (done) => {
      const options = {
        url: base,
        form: {
          username: "CoolCat55",
          email: "user@example.com",
          password: "password"
        }
      }
      request.post(options, (err, res, body) => {
        User.findOne({where: {email: "user@example.com"}})
        .then((user) => {
          expect(user).not.toBeNull();
          expect(user.username).toBe("CoolCat55")
          expect(user.email).toBe("user@example.com");
          expect(user.id).toBe(2);
          done();
        })
        .catch((err) => {
          console.log(err);
          done();
        });
      });
    });

    it("should not create a user with invalid values and redirect", (done) => {
      request.post(
        {
          url: base,
          form: {
            username: "a",
            email: "invalid",
            password: "password"
          }
        },
        (err, res, body) => {
          User.findOne({where: {email: "invalid"}})
          .then((user) => {
            expect(user).toBeNull();
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        }
      );
    });
  });

  describe("GET /users/sign_in", () => {
    it("should render a view with a sign in form", (done) => {
      request.get(`${base}sign_in`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("Sign In");
        done();
      });
    });
  });

  describe("GET /users/:id", () => {
    it("should render a view with a user profile", (done) => {
      request.get(`${base}${this.user.id}`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("Profile");
        done();
      });
    });
  });

  describe("POST /users/:id/upgrade", () => {
    it("should update a user role from standard to premium", (done) => {
      const options = {
        url: `${base}${this.user.id}/upgrade`,
        form: {
          role: 1
        }
      };
      request.post(options, (err, res, body) => {
        expect(err).toBeNull();
        User.findOne({
          where: { id: this.user.id }
        })
        .then((user) => {
          expect(user.role).toBe(1);
          done();
        });
      });
    });
  });

  describe("POST /users/:id/downgrade", () => {
    it("should update a user role from premium to standard", (done) => {
      const options = {
        url: `${base}${this.user.id}/downgrade`,
        form: {
          role: 0
        }
      };
      request.post(options, (err, res, body) => {
        expect(err).toBeNull();
        User.findOne({
          where: { id: this.user.id }
        })
        .then((user) => {
          expect(user.role).toBe(0);
          done();
        });
      });
    });
  });
});
