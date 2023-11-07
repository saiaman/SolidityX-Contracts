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

  let trx = await quaisContract["mint(address,uint256)"](
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
  console.log("Successfully minted ");
}

task("mint_ERC721", "Mints a NFT to a wallet")
  .addPositionalParam("contract", "The nft contract address")
  .addPositionalParam("wallet", "The destination wallet address")
  .setAction(async (taskArgs, hre) => {
    console.log("taskArgs", taskArgs);
    await hre.run("compile");
    await mintNft(taskArgs.contract, taskArgs.wallet, hre).catch(
      async (error) => {
        console.error(error);
        process.exitCode = 1;
      }
    );
  });
