// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

// Returns ether balance of a given address.
async function getBalance(address) {
  const balanceBigInt = await hre.waffle.provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt);
}

// Logs the ether balances for a list of addresses.
async function printBalances(addresses) {
  let idx = 0;
  for (const address of addresses) {
    console.log(`Address ${idx} balance: ${await getBalance(address)}`);
    idx++;
  }
}

// Logs the memos stored on-chain from coffee pruchases.
async function printMemos(memos) {
  for (const memo of memos) {
    // timestamp, tipper, tipperAddress, message
    console.log(
      `At ${memo.timestamp}, ${memo.name} (${memo.from}) said: ${memo.message}`
    );
  }
}

async function main() {
  // Get test accounts
  const [owner, tipper, tipper2, tipper3] = await hre.ethers.getSigners();

  // get the contract to deploy & deploy
  const BuyMeACoffee = await hre.ethers.getContractFactory("BuyMeACoffee");
  const buyMeACoffee = await BuyMeACoffee.deploy();
  await buyMeACoffee.deployed();

  console.log(`BuyMeACoffee deployed to ${buyMeACoffee.address}`);

  // check balances before the coffee purchase
  const addresses = [
    owner.address,
    tipper.address,
    tipper2.address,
    tipper3.address,
  ];
  console.log("== start ==");
  await printBalances(addresses);

  // buy owner a coffee
  const tip = { value: hre.ethers.utils.parseEther("1") };
  await buyMeACoffee
    .connect(tipper)
    .buyACoffee("Carolina", "Good stuff! 1", tip);
  await buyMeACoffee.connect(tipper2).buyACoffee("Tom", "Good stuff! 2", tip);
  await buyMeACoffee.connect(tipper3).buyACoffee("Steve", "Good stuff! 3", tip);

  // check balances after coffee purchase
  console.log("== coffee bought ==");
  await printBalances(addresses);

  // withdrawn funds
  await buyMeACoffee.connect(owner).withdrawTips();

  // check balance after withdrawn
  console.log("== withdraw funds ==");
  await printBalances(addresses);

  // read all memos left for the owner
  console.log("== memos ==");
  const memos = await buyMeACoffee.getMemos();
  printMemos(memos);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
