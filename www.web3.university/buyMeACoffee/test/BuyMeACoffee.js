const { expect } = require("chai");
const Web3 = require("web3");
const waitForExpect = require("wait-for-expect");

describe("BuyMeACoffee", function () {
  describe("Deployment", function () {
    it("Deployment should assign deploying address as a contract owner", async function () {
      const [owner] = await ethers.getSigners();

      const BuyMeACoffee = await ethers.getContractFactory("BuyMeACoffee");

      const buyMeACoffee = await BuyMeACoffee.deploy();

      expect(await buyMeACoffee.owner()).to.equal(await owner.getAddress());
    });
  });

  describe("buyACoffee", function () {
    it("Should fail if tipper sends 0 eth", async function () {
      const [owner, tipper1] = await ethers.getSigners();

      const BuyMeACoffee = await ethers.getContractFactory("BuyMeACoffee");

      const buyMeACoffee = await BuyMeACoffee.deploy();

      await expect(
        buyMeACoffee.connect(tipper1).buyACoffee("tom", "message 1", {
          value: ethers.utils.parseEther("0"),
        })
      ).to.be.revertedWith("Can't buy coffee with 0 ETH");
    });

    it("Tips are stored in contract balance", async function () {
      const [owner, tipper1] = await ethers.getSigners();

      const BuyMeACoffee = await ethers.getContractFactory("BuyMeACoffee");

      const buyMeACoffee = await BuyMeACoffee.deploy();

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
      const [owner, tipper1] = await ethers.getSigners();

      const BuyMeACoffee = await ethers.getContractFactory("BuyMeACoffee");

      const buyMeACoffee = await BuyMeACoffee.deploy();

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
      const [owner, tipper1] = await ethers.getSigners();

      const BuyMeACoffee = await ethers.getContractFactory("BuyMeACoffee");

      const buyMeACoffee = await BuyMeACoffee.deploy();

      const name = "tom";
      const msg = "message 1";
      await buyMeACoffee
        .connect(tipper1)
        .buyACoffee(name, msg, { value: ethers.utils.parseEther("1.000") });

      const name2 = "tom";
      const msg2 = "message 1";
      await buyMeACoffee
        .connect(tipper1)
        .buyACoffee(name2, msg2, { value: ethers.utils.parseEther("1.000") });

      const memos = await buyMeACoffee.getMemos();
      expect(memos).length(2);
      expect(memos[0][0]).eq(tipper1.address);
      expect(memos[0][2]).eq(name);
      expect(memos[0][3]).eq(msg);
      expect(memos[1][0]).eq(tipper1.address);
      expect(memos[1][2]).eq(name2);
      expect(memos[1][3]).eq(msg2);
    });
  });
});
