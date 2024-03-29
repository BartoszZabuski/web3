import { ethers } from "hardhat";

async function main() {
  try{
    const nftContractFactory = await ethers.getContractFactory("ChainBattles");
    const nftContract = await nftContractFactory.deploy();
    await nftContract.deployed();

    console.log("Contract deployed to: ", nftContract.address);
    process.exit(0);
  }catch(err){
    console.log(err);
    process.exit(1);
  }
}

main();
