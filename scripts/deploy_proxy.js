const quais = require("quais");
const hre = require("hardhat");
const { upgrades } = require("hardhat");
const { pollFor } = require("quais-polling");
async function main() {
  const ethersContract = await hre.ethers.getContractFactory(
    "QRC20XUpgradeable"
  );

  const quaisProvider = new quais.providers.JsonRpcProvider(
    hre.network.config.url
  );

  const walletWithProvider = new quais.Wallet(
    hre.network.config.accounts[0],
    quaisProvider
  );
  await quaisProvider.ready;

  const currentContractAddress = "0x92d1859D4E37E6d6A8d0f0A50715236879F54CA8";

  const proxyContract = await hre.ethers.getContractFactory("QProxy");
  // console.log(proxyContract.interface.fragments[0].inputs);
  // process.exit();
  const ProxyContractFactory = new quais.ContractFactory(
    proxyContract.interface.fragments,
    proxyContract.bytecode,
    walletWithProvider
  );

  const ProxyContract = await ProxyContractFactory.deploy(
    currentContractAddress,
    "0x",
    {
      gasLimit: 5000000,
    }
  );

  const proxyDeployReceipt = await pollFor(
    quaisProvider, // provider passed to poller
    "getTransactionReceipt", // method to call on provider
    [ProxyContract.deployTransaction.hash], // params to pass to method
    1.5, // initial polling interval in seconds
    1, // request timeout in seconds,
    600
  );

  console.log(
    "Proxy Contract deployed to address: ",
    proxyDeployReceipt.contractAddress
  );

  ProxyContract.attach(proxyDeployReceipt.contractAddress);

  await ProxyContract.initialize(
    "Saiaman01",
    "SAIA",
    quais.utils.parseEther("1000"),
    {
      gasLimit: 5000000,
    }
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
