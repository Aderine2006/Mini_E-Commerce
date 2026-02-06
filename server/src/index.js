require("dotenv").config();

const { createApp } = require("./app");
const { initDb } = require("./database/init");

async function main() {
  await initDb();

  const app = createApp();
  const port = Number(process.env.PORT || 4000);

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
