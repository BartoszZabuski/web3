
const hre = require("hardhat");

// Deployed to address 0xaea607F244396aafCe39E44EB51ffD1409d6143F

async function main() {
  
	// get the contract to deploy & deploy
	const BuyMeACoffee = await hre.ethers.getContractFactory("BuyMeACoffee");
	const buyMeACoffee = await BuyMeACoffee.deploy();
	await buyMeACoffee.deployed();
  
	console.log(`BuyMeACoffee deployed to ${buyMeACoffee.address}`);

  }
  
  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
  });
