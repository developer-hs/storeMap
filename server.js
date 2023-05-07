const app = require("./app");
const PORT = 8080;

app.listen(PORT, function () {
  console.log(`CORS-enabled web server listening on port ${PORT}`);
});
