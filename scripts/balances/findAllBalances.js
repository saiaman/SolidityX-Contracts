const { spawn } = require("child_process");

// Define the different chains you want to deploy to
const chains = [
  "cyprus1",
  "cyprus2",
  "cyprus3",
  "paxos1",
  "paxos2",
  "paxos3",
  "hydra1",
  "hydra2",
  "hydra3",
];

function deployToChain(chain) {
  return new Promise((resolve, reject) => {
    const deployProcess = spawn("npx", [
      "hardhat",
      "run",
      "--network",
      chain,
      "scripts/balances/getMyQuais.js",
    ]);

    deployProcess.stdout.on("data", (data) => {
      console.log(`[${chain}] ${data}`);
    });

    deployProcess.stderr.on("data", (data) => {
      console.error(`[${chain}] ${data}`);
    });

    deployProcess.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Deploy process exited with code ${code}`));
      }
    });
  });
}

(async () => {
  for (const chain of chains) {
    try {
      await deployToChain(chain);
    } catch (error) {
      console.error(
        `------ Failed to execute to ${chain}: ${error.message} ------`
      );
    }
  }
})();
