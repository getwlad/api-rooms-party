interface IUser {
  id: string;
  name: string;
  room: string;
}

class User {
  private users: IUser[];

  constructor() {
    this.users = [];
  }

  addUser(id: string, name: string, room: string) {
    let user = { id, name, room };
    this.users.push(user);
    return user;
  }

  getUserList(room: string) {
    let users = this.users.filter((user) => user.room === room);
    let namesArray = users.map((user) => user.name);
    return namesArray;
  }

  getUser(id: string) {
    return this.users.filter((user) => user.id === id)[0];
  }

  removeUser(id: string) {
    let user = this.getUser(id);

    if (user) {
      this.users = this.users.filter((user) => user.id !== id);
    }

    return user;
  }
}

module.exports = User;
