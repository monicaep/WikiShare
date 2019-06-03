module.exports = class ApplicationPolicy {
  constructor(user, record) {
    this.user = user;
    this.record = record;
  }

  _isOwner() {
    return this.record && (this.record.userId == this.user.id);
  }

  _isAdmin() {
    return this.user && this.user.role == 2;
  }

  _isPremium() {
    return this.user && this.user.role == 1;
  }

  _isCollaborator() {
    for (let i = 0; this.record.length; i++) {
      if(this.record.collaborators[i].username == this.user.username) {
        return true;
      }
      else {
        return false;
      }
    }
  }

  new() {
    return this.user != null;
  }

  create() {
    return this.new();
  }

  show() {
    return true;
  }

  edit() {
    return this.new() && this.record;
  }

  update() {
    return this.edit();
  }

  destroy() {
    return this.update();
  }
}
