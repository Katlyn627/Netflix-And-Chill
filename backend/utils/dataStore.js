async findUserByEmail(email) {
    const users = await this.loadUsers();
    return users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
  }