const ApplicationPolicy = require("./application");

module.exports = class PrivateWikiPolicy extends ApplicationPolicy {
  new() {
    return this.user._isPremium() || this.user._isAdmin();
  }

  create() {
    return this.new();
  }

  show() {
    return this.new();
  }

  edit() {
    return this.new() && this.record && (this._isOwner() || this._isAdmin());
  }

  update() {
    return this.edit();
  }

  destroy() {
    return this.update();
  }

  toggle() {
    return (this.user._isPremium() && this.user._isOwner()) || this.user._isAdmin()
  }
}
