const { task } = require("hardhat/config");
const util = require("node:util");
const spawn = util.promisify(require("node:child_process").spawn);
const { Promise } = require("bluebird");
const chains = [
  "cyprus1",
  // "cyprus2",
  // "cyprus3",
  // "paxos1",
  // "paxos2",
  // "paxos3",
  // "hydra1",
  // "hydra2",
  // "hydra3",
];

async function deployERC20_onChain(name, token, supply, chain, hre) {
  console.log(name, token, supply, chain);
  const run = await spawn(
    "npx",
    ["hardhat", "deploy_ERC20", "--network", chain, name, token, supply],
    { stdio: "inherit" }
  );
  console.log("log final", run.stdout);
  // return stdout;
  return;
}

task("deploy_ERC20_full", "Deploys ERC20 token")
  .addPositionalParam("name", "The token name")
  .addPositionalParam("token", "The token acronym")
  .addPositionalParam("supply", "The supply of token")
  .setAction(async (taskArgs, hre) => {
    console.log("taskArgs", taskArgs);
    await hre.run("compile");
    await Promise.map(chains, async (chain) => {
      await deployERC20_onChain(
        taskArgs.name,
        taskArgs.token,
        taskArgs.supply,
        chain,
        hre
      );
    });
  });
