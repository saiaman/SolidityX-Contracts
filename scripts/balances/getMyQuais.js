const quais = require("quais");
const hre = require("hardhat");
const { pollFor } = require("quais-polling");

async function main() {
  const quaisProvider = new quais.providers.JsonRpcProvider(
    hre.network.config.url
  );
  const walletWithProvider = new quais.Wallet(
    hre.network.config.accounts[0],
    quaisProvider
  );
  let balance = await walletWithProvider.getBalance();
  console.log(quais.utils.formatEther(balance));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
