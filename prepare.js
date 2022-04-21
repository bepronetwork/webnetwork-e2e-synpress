const fs = require("fs");
const keys = require("./keys.json");

const pathKeys = "SYNPRESS_PRIVATEKEY";
const pathEnv = ".env";

const address = Object.values(keys.private_keys)[0];

const main = () => {
  fs.readdirSync(__dirname).forEach((file) => {
    if (file === "SYNPRESS_PRIVATEKEY") {
      fs.unlink(pathKeys, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        //file removed
      });
    }
    if (file === ".env") {
      fs.unlink(pathEnv, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        //file removed
      });
    }
  });

  fs.writeFile("SYNPRESS_PRIVATEKEY", address, { flag: "a+" }, (err) => {
    if (err) console.log("err writeFile -> ", err);
  });
  fs.writeFile(".env", `PRIVATE_KEY=${address}`, { flag: "a+" }, (err) => {
    if (err) console.log("err writeFile -> ", err);
  });
};

main();
