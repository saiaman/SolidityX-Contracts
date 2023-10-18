const quais = require("quais");
const hre = require("hardhat");
const { upgrades } = require("hardhat");

async function main() {
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

  const instance = await upgrades.deployProxy(QuaisContract, [
    "Saiaman01",
    "SAIA",
    quais.utils.parseEther("1000"),
  ]);
  await instance.waitForDeployment();

  const quaisContract = await QuaisContract.deploy(
    "Saiaman01",
    "SAIA",
    quais.utils.parseEther("1000"),
    {
      gasLimit: 1000000,
    }
  );

  await quaisContract.deployed();
  console.log("Deployed at:", quaisContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
