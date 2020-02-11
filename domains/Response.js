class Response {
  constructor(props) {
    const { data, message, code } = props;
    this.data = data,
    this.message = message,
    this.code = code
  }
}

module.exports = Response;
