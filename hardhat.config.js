/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require("@nomicfoundation/hardhat-toolbox");
require("./scripts/nft/mint");
require("./tasks");

const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

const chainId = Number(process.env.CHAINID);

module.exports = {
  defaultNetwork: "cyprus1",
  networks: {
    cyprus1: {
      url: process.env.CYPRUS1URL,
      accounts: [process.env.CYPRUS1PK],
      chainId: chainId,
    },
    cyprus2: {
      url: `${process.env.CYPRUS2URL}`,
      accounts: [process.env.CYPRUS2PK],
      chainId: chainId,
    },
    cyprus3: {
      url: `${process.env.CYPRUS3URL}`,
      accounts: [process.env.CYPRUS3PK],
      chainId: chainId,
    },
    paxos1: {
      url: `${process.env.PAXOS1URL}`,
      accounts: [process.env.PAXOS1PK],
      chainId: chainId,
    },
    paxos2: {
      url: `${process.env.PAXOS2URL}`,
      accounts: [process.env.PAXOS2PK],
      chainId: chainId,
    },
    paxos3: {
      url: `${process.env.PAXOS3URL}`,
      accounts: [process.env.PAXOS3PK],
      chainId: chainId,
    },
    hydra1: {
      url: `${process.env.HYDRA1URL}`,
      accounts: [process.env.HYDRA1PK],
      chainId: chainId,
    },
    hydra2: {
      url: `${process.env.HYDRA2URL}`,
      accounts: [process.env.HYDRA2PK],
      chainId: chainId,
    },
    hydra3: {
      url: `${process.env.HYDRA3URL}`,
      accounts: [process.env.HYDRA3PK],
      chainId: chainId,
    },
  },

  // change compiler version based on version defined in your smart contract
  solidity: {
    compilers: [
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: "0.8.1",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: "0.8.2",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },

  paths: {
    sources: "./contracts",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 20000,
  },
};
