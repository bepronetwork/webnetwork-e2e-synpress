const express = require("express");
const { Web3Connection } = require("@taikai/dappkit");
require("dotenv").config();

async function defaultWeb3Connection(start = false) {
  const web3Connection = new Web3Connection(
    (options = {
      web3Host: process.env.HOSTCHAIN,
      privateKey: process.env.PRIVATE_KEY,
      skipWindowAssignment: true,
    })
  );
  if (start) await web3Connection.start();

  return web3Connection;
}

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
      if (err) {
        reject(err);
      } else {
        provider.send(mine, (err, resp) => {
          if (err) reject(err);
          resolve(resp);
        });
      }
    });
  });
}

app.post("/increaseTime", async (req, res) => {
  const { time } = req.body;
  const web3connection = await defaultWeb3Connection(true);
  await increaseTime(time, web3connection.Web3)
    .then(() => res.send("OK"))
    .catch(() => {
      res.send("NOK");
    });
});

app.listen(port, () => {
  console.log(`Bepro service listening on port ${port}`);
});
