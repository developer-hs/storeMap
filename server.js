import { app } from './app.js';
// import getAdminJs from './admin.js';

const PORT = process.env.PORT || 8080;

app.listen(PORT, async () => {
  // const adminJs = await getAdminJs();
  console.log(
    `CORS-enabled web server listening on port http://localhost:${PORT}`
  );
});
