import { app } from "./app.js";
import getAdminJs from "./admin.js";
import https from "https";
import fs from "fs";

const PORT = 8080;
const HTTPS_PORT = 8000;

const certOptions = {
  key: fs.readFileSync("./cert/create-cert-key.pem"),
  cert: fs.readFileSync("./cert/create-cert.pem"),
};

app.listen(PORT, async () => {
  const adminJs = await getAdminJs();
  console.log(
    `CORS-enabled web server listening on port http://localhost:${PORT}`
  );
  console.log(
    `AdminJS started on http://localhost:${PORT}${adminJs.admin.options.rootPath}`
  );
});

https.createServer(certOptions, app).listen(HTTPS_PORT, () => {
  console.log(`HTTPS server started on port http://localhost:${HTTPS_PORT}`);
});
