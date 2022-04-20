const express = require("express");
const { Web3Connection, Network } = require("bepro-js");

const web3connection = new Web3Connection({
  web3Host: "http://127.0.0.1:8545",
  privateKey:
    "0x17c40c097972bd61e1fb43e266ba4c357068cdad1d6987ca9c89c44eb881a778",
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

  console.log("increaseTime 1 -");

  return new Promise((resolve, reject) => {
    provider.send(timeAdvance, (err) => {
      console.log("increaseTime 2 -", err);
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
  await increaseTime(time, web3connection.Web3).then(() =>
    res.send("time advanced successfully ")
  );
});

app.listen(port, () => {
  console.log(`Bepro service listening on port ${port}`);
});
