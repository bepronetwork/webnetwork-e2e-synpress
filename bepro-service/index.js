const express = require("express");
const { Web3Connection } = require("@taikai/dappkit");
require("dotenv").config();

const web3connection = new Web3Connection({
  web3Host: process.env.HOSTNAME,
  privateKey: process.env.PRIVATE_KEY,
  skipWindowAssignment: true,
});
web3connection.start();

const app = express();
app.use(express.json());
const port = 3005;

const payload = (method, params) => ({
  jsonrpc: `2.0`,
  method,
  params,
  id: 0,
});

async function increaseTime(time, web3) {
  const timeAdvance = payload(`evm_increaseTime`, [time]);
  const mine = payload(`evm_mine`, []);
  const provider = web3.currentProvider;

  return new Promise((resolve, reject) => {
    provider.send(timeAdvance, (err) => {
      if (err) reject(err);
      else
        provider.send(mine, (err, resp) => {
          if (err) reject(err);
          resolve(resp);
        });
    });
  });
}

app.post("/increaseTime", async (req, res) => {
  const { time } = req.body;
  await increaseTime(time, web3connection.Web3)
    .then(() => res.send("OK"))
    .catch(() => {
      res.send("NOK");
    });
});

app.listen(port, () => {
  console.log(`Bepro service listening on port ${port}`);
});
