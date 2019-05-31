const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const validation = require("./validation");

router.get("/users/sign_up", userController.signUp);
router.get("/users/sign_in", userController.signInForm);
router.get("/users/sign_out", userController.signOut);
router.get("/users/:id", userController.show);
router.get("/users/:id/upgradeForm", userController.upgradeForm);
router.get("/users/upgradeSuccess", userController.upgradeSuccess);
router.get("/users/:id/downgradeForm", userController.downgradeForm);
router.get("/users/downgradeSuccess", userController.downgradeSuccess);

router.post("/users", validation.validateUsers, userController.create);
router.post("/users/sign_in", userController.signIn);
router.post("/users/:id/upgrade", userController.upgrade);
router.post("/users/:id/downgrade", userController.downgrade);

module.exports = router;
