const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/wikis/"
const sequelize = require("../../src/db/models/index").sequelize;
const Wiki = require("../../src/db/models").Wiki;
const User = require("../../src/db/models").User;

describe("routes : wikis", () => {
  beforeEach((done) => {
    this.user;
    this.wiki;

    sequelize.sync({force: true}).then((res) => {
      User.create({
        username: "ExampleUser",
        email: "example@example.com",
        password: "123456"
      })
      .then((user) => {
        this.user = user;

        Wiki.create({
          title: "Dogs",
          body: "There are over 300 breeds.",
          userId: this.user.id
        })
        .then((wiki) => {
          this.wiki = wiki;
          done();
        });
      });
    });
  });

  describe("admin user performing CRUD actions for Wiki", () => {
    beforeEach((done) => {
      User.create({
        username: "MrAdmin",
        email: "admin@example.com",
        password: "password",
        role: 2
      })
      .then((user) => {
        request.get({
          url: "http://localhost:3000/auth/fake",
          form: {
            role: user.role,
            userId: user.id,
            email: user.email
          }
        },
          (err, res, body) => {
            done();
          }
        );
      });
    });

    describe("GET /wikis", () => {
      it("should return a status code 200 and all wikis", (done) => {
        request.get(base, (err, res, body) => {
          expect(res.statusCode).toBe(200);
          expect(err).toBeNull();
          expect(body).toContain("Wikis");
          done();
        });
      });
    });

    describe("GET /wikis/new", () => {
      it("should render a new wiki form", (done) => {
        request.get(`${base}new`, (err, res, body) => {
          expect(err).toBeNull();
          done();
        });
      });
    });

    describe("POST /wikis/create", () => {
      const options = {
        url: `${base}create`,
        form: {
          title: "New Wiki",
          description: "This is a new wiki."
        }
      };

      it("should create a new wiki and redirect", (done) => {
        request.post(options, (err, res, body) => {
          Wiki.findOne({where: {title: "New Wiki"}})
          .then((wiki) => {
            expect(res.statusCode).toBe(303);
            expect(wiki.title).toBe("New Wiki");
            expect(wiki.description).toBe("This is a new wiki.");
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });
    });

    describe("GET /wikis/:id", () => {
      it("should render a view with the selected wiki", (done) => {
        request.get(`${base}${this.wiki.id}`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Dogs");
          done();
        });
      });
    });

    describe("GET /wikis/:id/edit", () => {
      it("should render a view with an edit wiki form", (done) => {
        request.get(`${base}${this.wiki.id}/edit`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Edit Wiki");
          expect(body).toContain("Dogs");
          done();
        });
      });
    });

    describe("POST /wikis/:id/update", () => {
      it("should update the wiki with the given values", (done) => {
        const options = {
          url: `${base}${this.wiki.id}/update`,
          form: {
            title: "Canis lupus familiaris",
            body: "There are over 300 breeds."
          }
        };
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();
          Wiki.findOne({
            where: { id: this.wiki.id }
          })
          .then((wiki) => {
            expect(wiki.title).toBe("Canis lupus familiaris");
            done();
          });
        });
      });
    });

    describe("POST /wikis/:id/destroy", () => {
      it("should delete the wiki with the associated ID", (done) => {
        expect(this.wiki.id).toBe(1);
        request.post(`${base}${this.wiki.id}/destroy`, (err, res, body) => {
          Wiki.findById(1)
          .then((wiki) => {
            expect(err).toBeNull();
            expect(wiki).toBeNull();
            done();
          });
        });
      });
    });
  });//end of admin CRUD

  describe("premium user performing CRUD actions for wiki", () => {
    beforeEach((done) => {
      request.get({
        url: "http://localhost:3000/auth/fake",
        form: {
          role: 1
        }
      },
        (err, res, body) => {
          done();
        }
      );
    });

    describe("GET /wikis", () => {
      it("should return a status code 200 and all wikis", (done) => {
        request.get(base, (err, res, body) => {
          expect(res.statusCode).toBe(200);
          expect(err).toBeNull();
          expect(body).toContain("Wikis");
          done();
        });
      });
    });

    describe("GET /wikis/new", () => {
      it("should render a new wiki form", (done) => {
        request.get(`${base}new`, (err, res, body) => {
          expect(err).toBeNull();
          done();
        });
      });
    });

    describe("POST /wikis/create", () => {
      const options = {
        url: `${base}create`,
        form: {
          title: "New Wiki",
          description: "This is a new wiki."
        }
      };

      it("should create a new wiki and redirect", (done) => {
        request.post(options, (err, res, body) => {
          Wiki.findOne({where: {title: "New Wiki"}})
          .then((wiki) => {
            expect(res.statusCode).toBe(303);
            expect(wiki.title).toBe("New Wiki");
            expect(wiki.description).toBe("This is a new wiki.");
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });
    });

    describe("GET /wikis/:id", () => {
      it("should render a view with the selected wiki", (done) => {
        request.get(`${base}${this.wiki.id}`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Dogs");
          done();
        });
      });
    });

    describe("POST /wikis/:id/destroy", () => {
      it("should delete the wiki with the associated ID", (done) => {
        Wiki.all()
        .then((wikis) => {
          const wikiCountBeforeDelete = wikis.length;
          expect(wikiCountBeforeDelete).toBe(1);

          request.post(`${base}${this.wiki.id}/destroy`, (err, res, body) => {
            Wiki.all()
            .then((wikis) => {
              expect(err).toBeNull();
              expect(wikis.length).toBe(wikiCountBeforeDelete - 1);
              done();
            });
          });
        });
      });
    });

    describe("GET /wikis/:id/edit", () => {
      it("should render a view with an edit wiki form", (done) => {
        request.get(`${base}${this.wiki.id}/edit`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Edit Wiki");
          expect(body).toContain("Dogs");
          done();
        });
      });
    });

    describe("POST /wikis/:id/update", () => {
      it("should update the wiki with the given values", (done) => {
        const options = {
          url: `${base}${this.wiki.id}/update`,
          form: {
            title: "Canis lupus familiaris",
            body: "There are over 300 breeds."
          }
        };
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();
          Wiki.findOne({
            where: { id: this.wiki.id }
          })
          .then((wiki) => {
            expect(wiki.title).toBe("Canis lupus familiaris");
            done();
          });
        });
      });
    });
  });//end of premium CRUD

  describe("standard user performing CRUD actions for Wiki", () => {

    describe("GET /wikis", () => {
      it("should return a status code 200 and all wikis", (done) => {
        request.get(base, (err, res, body) => {
          expect(res.statusCode).toBe(200);
          expect(err).toBeNull();
          expect(body).toContain("Wikis");
          done();
        });
      });
    });

    describe("GET /wikis/new", () => {
      it("should render a new wiki form", (done) => {
        request.get(`${base}new`, (err, res, body) => {
          expect(err).toBeNull();
          done();
        });
      });
    });

    describe("POST /wikis/create", () => {
      const options = {
        url: `${base}create`,
        form: {
          title: "New Wiki",
          description: "This is a new wiki."
        }
      };

      it("should create a new wiki and redirect", (done) => {
        request.post(options, (err, res, body) => {
          Wiki.findOne({where: {title: "New Wiki"}})
          .then((wiki) => {
            expect(res.statusCode).toBe(303);
            expect(wiki.title).toBe("New Wiki");
            expect(wiki.description).toBe("This is a new wiki.");
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        });
      });
    });

    describe("GET /wikis/:id", () => {
      it("should render a view with the selected wiki", (done) => {
        request.get(`${base}${this.wiki.id}`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Dogs");
          done();
        });
      });
    });

    describe("GET /wikis/:id/edit", () => {
      it("should render a view with an edit wiki form", (done) => {
        request.get(`${base}${this.wiki.id}/edit`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Edit Wiki");
          expect(body).toContain("Dogs");
          done();
        });
      });
    });

    describe("POST /wikis/:id/update", () => {
      it("should update the wiki with the given values", (done) => {
        const options = {
          url: `${base}${this.wiki.id}/update`,
          form: {
            title: "Canis lupus familiaris",
            body: "There are over 300 breeds."
          }
        };
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();
          Wiki.findOne({
            where: { id: this.wiki.id }
          })
          .then((wiki) => {
            expect(wiki.title).toBe("Canis lupus familiaris");
            done();
          });
        });
      });
    });

    describe("POST /wikis/:id/destroy", () => {
      it("should delete the wiki with the associated ID", (done) => {
        expect(this.wiki.id).toBe(1);
        request.post(`${base}${this.wiki.id}/destroy`, (err, res, body) => {
          Wiki.findById(1)
          .then((wiki) => {
            expect(err).toBeNull();
            expect(wiki).toBeNull();
            done();
          });
        });
      });
    });
  });//end of standard CRUD
});
