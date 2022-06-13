const fs = require("fs");
const keys = require("./keys.json");
const path = require("node:path");
require("dotenv").config();

const address = Object.values(keys.private_keys)[0];
const HOSTNAME = process.env.HOSTNAME

const main = () => {
  if (fs.readFileSync(path.resolve(__dirname, "SYNPRESS_PRIVATEKEY")))
    fs.unlinkSync(path.resolve(__dirname, "SYNPRESS_PRIVATEKEY"));
  fs.writeFileSync(
    path.resolve(__dirname, "SYNPRESS_PRIVATEKEY"),
    address,
    "utf-8"
  );

  if (fs.readFileSync(path.resolve(__dirname, ".env")))
    fs.unlinkSync(path.resolve(__dirname, ".env"));
  fs.writeFileSync(
    path.resolve(__dirname, ".env"),
    `PRIVATE_KEY=${address}
    HOSTNAME=${HOSTNAME}`,
    "utf-8"
  );
};

main();
