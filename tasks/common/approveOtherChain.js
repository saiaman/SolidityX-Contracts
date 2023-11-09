const quais = require("quais");
const { task } = require("hardhat/config");
const { pollFor } = require("quais-polling");

async function mintNft(contractAddress, destinationAddress, hre) {
  const ethersContract = await hre.ethers.getContractFactory("QRC721");

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

  let trx = await quaisContract["AddApprovedAddress(address)"](
    destinationAddress,
    1,
    {
      gasLimit: 5000000,
    }
  );

  // Use quais-polling shim to wait for contract to be deployed
  const deployReceipt = await pollFor(
    quaisProvider, // provider passed to poller
    "getTransactionReceipt", // method to call on provider
    [trx.hash], // params to pass to method
    1.5, // initial polling interval in seconds
    1, // request timeout in seconds,
    600
  );
  console.log("Contract deployed to address: ", deployReceipt.contractAddress);
}

task("approve_other_chain", "Approves another chain address for the contract")
  .addPositionalParam("contract", "The nft contract address")
  .addPositionalParam("address", "The destination contract address")
  .setAction(async (taskArgs, hre) => {
    console.log("taskArgs", taskArgs);
    await hre.run("compile");
    await mintNft(taskArgs.contract, taskArgs.address, hre).catch(
      async (error) => {
        console.error(error);
        process.exitCode = 1;
      }
    );
  });
