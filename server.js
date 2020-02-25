const App = require('./app');
const port = process.env.PORT || 8080;

App.listen(port, () => {
  console.log('Server is running..');
});
