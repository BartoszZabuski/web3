const { expect } = require("chai");
const Web3 = require("web3");
const waitForExpect = require("wait-for-expect");

const printBalance = async (name, address, inEth = true) => {
  let value = await ethers.provider.getBalance(
    address
  );

  if(inEth){
    value = Web3.utils.fromWei(
      `${value}`,
      "ether"
    );

  }
  
  console.log(`${name}: ${address} balance: ${value}`);
    
}

const contractSetup = async () => {
  // A Signer in ethers.js is an object that represents an Ethereum account. 
  // It's used to send transactions to contracts and other accounts.
  const [owner, tipper1, tipper2, newWithdrawalAddress] = await ethers.getSigners();

  const BuyMeACoffee = await ethers.getContractFactory("BuyMeACoffee");

  const buyMeACoffee = await BuyMeACoffee.deploy();

  return { BuyMeACoffee, buyMeACoffee, owner, tipper1, tipper2, newWithdrawalAddress };
}

describe("BuyMeACoffee", function () {

  describe("Deployment", function () {
    it("Deployment should assign deploying address as a contract owner", async function () {
      const { buyMeACoffee, owner } = await contractSetup();

      expect(await buyMeACoffee.owner()).to.equal(await owner.getAddress());
    });
  });

  describe("buyACoffee", function () {
    it("Should fail if tipper sends 0 eth", async function () {
      const { buyMeACoffee, tipper1 } = await contractSetup();

      await expect(
        buyMeACoffee.connect(tipper1).buyACoffee("tom", "message 1", {
          value: ethers.utils.parseEther("0"),
        })
      ).to.be.revertedWith("Can't buy coffee with 0 ETH");
    });

    it("Tips are stored in contract balance", async function () {
      const { buyMeACoffee, tipper1 } = await contractSetup();

      const beforeTipper1Balance = await ethers.provider.getBalance(
        tipper1.address
      );

      await expect(await buyMeACoffee.balanceOf()).eq(0);

      const numberOfTips = 10;

      for (let index = 0; index < numberOfTips; index++) {
        await expect(
          buyMeACoffee.connect(tipper1).buyACoffee("tom", "message 1", {
            value: ethers.utils.parseEther("1.000"),
          })
        );
      }

      await waitForExpect(async () => {
        const afterTipper1Balance = await ethers.provider.getBalance(
          tipper1.address
        );

        const tipperBalanceDiff = beforeTipper1Balance - afterTipper1Balance;
        const tipperBalanceDiffEth = Web3.utils.fromWei(
          `${tipperBalanceDiff}`,
          "ether"
        );
        const contractBalanceEth = Web3.utils.fromWei(
          `${await buyMeACoffee.balanceOf()}`,
          "ether"
        );

        // tipper1 balance difference after tipping
        await expect(Math.floor(tipperBalanceDiffEth)).eq(numberOfTips);
        // contract balance after tipping
        await expect(Math.floor(contractBalanceEth)).eq(numberOfTips);
      });
    });

    it("Action of tipping should emit a memo", async function () {
      const { buyMeACoffee, tipper1 } = await contractSetup();

      const name = "tom";
      const msg = "message 1";
      await expect(
        buyMeACoffee
          .connect(tipper1)
          .buyACoffee(name, msg, { value: ethers.utils.parseEther("1.000") })
      )
        .to.emit(buyMeACoffee, "NewMemo")
        // hack for omitting block.timestamp for time being
        .withArgs(tipper1.address, [], name, msg);
    });
  });

  describe("getMemos", () => {
    it("should return all memos", async function () {
      const { buyMeACoffee, tipper1, tipper2 } = await contractSetup();

      const name = "tom";
      const msg = "message 1";
      await buyMeACoffee
        .connect(tipper1)
        .buyACoffee(name, msg, { value: ethers.utils.parseEther("1.000") });

      const name2 = "tom";
      const msg2 = "message 1";
      await buyMeACoffee
        .connect(tipper2)
        .buyACoffee(name2, msg2, { value: ethers.utils.parseEther("1.000") });

      const memos = await buyMeACoffee.getMemos();
      expect(memos).length(2);
      expect(memos[0][0]).eq(tipper1.address);
      expect(memos[0][2]).eq(name);
      expect(memos[0][3]).eq(msg);
      expect(memos[1][0]).eq(tipper2.address);
      expect(memos[1][2]).eq(name2);
      expect(memos[1][3]).eq(msg2);
    });
  });

  describe("updateWithdrawalAddress", () => {
    
    it("only owner can change withdrawal address", async function () {
      const { buyMeACoffee, tipper1 } = await contractSetup();

      await expect(
        buyMeACoffee
        .connect(tipper1)
        .updateWithdrawalAddress(tipper1.address)
      ).to.be.revertedWith("Only contract owner can update withdrawal address");
    });

    it("intially owner's address is set for withdrawal address", async function () {
      const { buyMeACoffee, owner, tipper1 } = await contractSetup();

      const name = "tom";
      const msg = "message 1";

      const ownerBalanceBefore = await ethers.provider.getBalance(
        owner.address
      );

      const ownerBalanceBeforeEth = Web3.utils.fromWei(
        `${ownerBalanceBefore}`,
        "ether"
      );

      await expect(await buyMeACoffee.balanceOf()).eq(0);
      
      await expect(
        buyMeACoffee.connect(tipper1).buyACoffee("tom", "message 1", {
          value: ethers.utils.parseEther("1.000"),
        })
      );
      await expect(
        buyMeACoffee.connect(tipper1).buyACoffee("tom2", "message 2", {
          value: ethers.utils.parseEther("1.000"),
        })
      );

      await expect(
        buyMeACoffee
          .connect(tipper1)
          .withdrawTips()
      )

      await waitForExpect(async () => {
        const ownerBalanceAfter = await ethers.provider.getBalance(
          owner.address
        );

        const ownerBalanceAfterEth = Web3.utils.fromWei(
                  `${ownerBalanceAfter}`,
                  "ether"
                );

        const contractBalanceAfterEth = Web3.utils.fromWei(
          `${await buyMeACoffee.balanceOf()}`,
          "ether"
        );

        await expect(Math.floor(contractBalanceAfterEth)).eq(0);
        await expect(Math.floor(ownerBalanceAfterEth - ownerBalanceBeforeEth)).eq(2);
      });

    });

    it("withdrawal address can be updated", async function () {
      const { buyMeACoffee, owner, tipper1, newWithdrawalAddress } = await contractSetup();

      await printBalance('owner', owner.address);
      await printBalance('tipper1', tipper1.address);
      await printBalance('newWithdrawalAddress', newWithdrawalAddress.address);
      await printBalance('contract', buyMeACoffee.address);

      const newWithdrawalAddressBalanceBefore = await ethers.provider.getBalance(
        newWithdrawalAddress.address
      );

      const newWithdrawalAddressBalanceBeforeEth = Web3.utils.fromWei(
        `${newWithdrawalAddressBalanceBefore}`,
        "ether"
      );

      await expect(await buyMeACoffee.balanceOf()).eq(0);
      
      await expect(
        buyMeACoffee.connect(tipper1).buyACoffee("tom", "message 1", {
          value: ethers.utils.parseEther("1.000"),
        })
      );
      await expect(
        buyMeACoffee.connect(tipper1).buyACoffee("tom2", "message 2", {
          value: ethers.utils.parseEther("1.000"),
        })
      );

      await expect(buyMeACoffee
        .connect(owner)
        .updateWithdrawalAddress(newWithdrawalAddress.address));

      await expect(buyMeACoffee
          .connect(owner)
          .withdrawTips());

      await waitForExpect(async () => {

        await printBalance('owner', owner.address);
        await printBalance('tipper1', tipper1.address);
        await printBalance('newWithdrawalAddress', newWithdrawalAddress.address);
        await printBalance('contract', buyMeACoffee.address);

      const newWithdrawalAddressBalanceAfter = await ethers.provider.getBalance(
        newWithdrawalAddress.address
      );

      const newWithdrawalAddressBalanceAfterEth = Web3.utils.fromWei(
        `${newWithdrawalAddressBalanceAfter}`,
        "ether"
      );

        await expect(Math.floor(newWithdrawalAddressBalanceAfterEth - newWithdrawalAddressBalanceBeforeEth)).eq(2);
      });

    });

  });
});
