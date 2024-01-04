const quais = require("quais");
const { task } = require("hardhat/config");
const { pollFor } = require("quais-polling");

async function callCreate(contractAddress, message, hre) {
  const ethersContract = await hre.ethers.getContractFactory("SampleCreate");

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

  const quaisContract = await QuaisContract.attach(contractAddress);
  //   console.log(quaisContract);
  //   process.exit();
  let trx = await quaisContract["createTest(string)"](message, {
    gasLimit: 5000000,
  });

  console.log(trx);

  // Use quais-polling shim to wait for contract to be deployed
  const deployReceipt = await pollFor(
    quaisProvider, // provider passed to poller
    "getTransactionReceipt", // method to call on provider
    [trx.hash], // params to pass to method
    1.5, // initial polling interval in seconds
    1, // request timeout in seconds,
    600
  );
  console.log("Contract deployed to address: ", deployReceipt);
  let parsedLogs = deployReceipt.logs.map((l) =>
    ethersContract.interface.parseLog(l)
  );
  let cleaned = JSON.parse(JSON.stringify(parsedLogs[0].args));
  let targetAddress = cleaned[0];
  console.log(`HelloWorld deployed at ${targetAddress}`);

  const HelloWorld = await hre.ethers.getContractFactory("HelloWorld");
  let contract = await HelloWorld.attach(targetAddress);
  console.log(await contract.message());
}

task("call_create", "calls create")
  .addPositionalParam("contract", "The nft contract address")
  .addPositionalParam("message", "The message for hello world")
  .setAction(async (taskArgs, hre) => {
    console.log("taskArgs", taskArgs);
    await hre.run("compile");
    await callCreate(taskArgs.contract, taskArgs.message, hre).catch(
      async (error) => {
        console.error(error);
        process.exitCode = 1;
      }
    );
  });
