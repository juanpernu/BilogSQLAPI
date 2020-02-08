class User {
  constructor(props) {
    const { user, user_bilog, password } = props;
    
    this.access = {
      user: user,
      user_bilog: user_bilog,
      password: password,
    }   
  }
}

module.exports = User;
