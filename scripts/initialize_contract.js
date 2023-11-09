const quais = require("quais");
const hre = require("hardhat");
const { upgrades } = require("hardhat");
const { pollFor } = require("quais-polling");
async function main() {
  const quaisProvider = new quais.providers.JsonRpcProvider(
    hre.network.config.url
  );

  const walletWithProvider = new quais.Wallet(
    hre.network.config.accounts[0],
    quaisProvider
  );
  await quaisProvider.ready;

  const currentContractAddress = "0x92d1859D4E37E6d6A8d0f0A50715236879F54CA8";
  const currentProxyAddress = "0x9654CAaec35E31E66C8F72C6A8f91aa9545eA6CE";

  const ethersContract = await hre.ethers.getContractFactory(
    "QRC20XUpgradeable"
  );
  // console.log(proxyContract.interface.fragments[0].inputs);
  // process.exit();
  const QuaisContract = new quais.ContractFactory(
    ethersContract.interface.fragments,
    ethersContract.bytecode,
    walletWithProvider
  );

  const ProxyContract = await QuaisContract.attach(
    "0x9654CAaec35E31E66C8F72C6A8f91aa9545eA6CE"
  );
  console.log(ProxyContract["initialize(string,string,uint256)"]);

  await ProxyContract["initialize(string,string,uint256)"](
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
