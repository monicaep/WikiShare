const ApplicationPolicy = require("./application");

module.exports = class PrivateWikiPolicy extends ApplicationPolicy {

  new() {
    return this.user._isPremium() || this.user._isAdmin();
  }

  create() {
    return this.new();
  }

  show() {
    return this.user._isOwner() || this.user._isCollaborator() || this.user._isAdmin();
  }

  edit() {
    return this.record && this.show();
  }

  update() {
    return this.edit();
  }

  destroy() {
    return this.user._isOwner() || this.user._isAdmin();
  }

  toggle() {
    return (this.user._isPremium() && (this.user._isOwner()) || this.user._isAdmin());
  }
}
