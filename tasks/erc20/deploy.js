const quais = require("quais");
const { task } = require("hardhat/config");
const { pollFor } = require("quais-polling");

async function deployERC20(name, token, supply, hre) {
  const ethersContract = await hre.ethers.getContractFactory("QRC20");

  const quaisProvider = new quais.providers.JsonRpcProvider(
    hre.network.config.url
  );

  const walletWithProvider = new quais.Wallet(
    hre.network.config.accounts[0],
    quaisProvider
  );
  await quaisProvider.ready;

  const QuaisContract = new quais.ContractFactory(
    ethersContract.interface.fragments,
    ethersContract.bytecode,
    walletWithProvider
  );

  const quaisContract = await QuaisContract.deploy(
    name,
    token,
    quais.utils.parseEther(supply),
    {
      gasLimit: 5000000,
    }
  );
  const deployReceipt = await pollFor(
    quaisProvider, // provider passed to poller
    "getTransactionReceipt", // method to call on provider
    [quaisContract.deployTransaction.hash], // params to pass to method
    1.5, // initial polling interval in seconds
    1, // request timeout in seconds,
    600
  );
  console.log("Contract deployed to address: ", deployReceipt.contractAddress);
}

task("deploy_ERC20", "Deploys ERC20 token")
  .addPositionalParam("name", "The token name")
  .addPositionalParam("token", "The token acronym")
  .addPositionalParam("supply", "The supply of token")
  .setAction(async (taskArgs, hre) => {
    console.log("taskArgs", taskArgs);
    await hre.run("compile");
    await deployERC20(
      taskArgs.name,
      taskArgs.token,
      taskArgs.supply,
      hre
    ).catch(async (error) => {
      console.error(error);
      process.exitCode = 1;
    });
  });
