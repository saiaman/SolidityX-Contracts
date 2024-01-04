const quais = require("quais");
const hre = require("hardhat");
const { pollFor } = require("quais-polling");

const myAdresses = [
  "0x11ef4b2a240d7c134c1b816e5aafabe897b47a4e",
  "0x319bb45b684844c83e059db69fbc037289d4862c",
  "0x56619b326fc200dd2caf41a4aec4ce9de2dfb4a3",
  "0x728f5cadbbed7ab8a3436a6476cf4401a6ca3772",
  "0x77464d87a8535b7b17bcc8de7dd090dee5e83db2",
  "0x92e00422dc4d84115e299f66fdd3e16d40d5e987",
  "0xb342d419bee5e590cdbdcdb62433c63200dc80af",
  "0xd93beec1121d93da654d898847a2b533d73effd3",
  "0xf16296df8cde653897ea990a09f29fa540d7de79",
];

async function main() {
  const ethersContract = await hre.ethers.getContractFactory("Hurricane");

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

  const quaisContract = await QuaisContract.deploy(myAdresses, {
    gasLimit: 5000000,
  });

  // Use quais-polling shim to wait for contract to be deployed
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

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
