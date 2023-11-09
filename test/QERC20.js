const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token contract", function () {
  let Token;
  let token;
  let owner;
  let buyer;

  beforeEach(async function () {
    Token = await ethers.getContractFactory("QRC20");
    token = await Token.deploy(
      "Sample QRC20",
      "QRC2",
      ethers.utils.parseEther("1000")
    );

    [owner, buyer] = await ethers.getSigners();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await token.balanceOf(owner.address)).to.equal(
        ethers.utils.parseEther("1000")
      );
    });

    it("Should set the total supply", async function () {
      expect(await token.totalSupply()).to.equal(
        ethers.utils.parseEther("1000")
      );
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      await token.transfer(buyer.address, 100);
      expect(await token.balanceOf(owner.address)).to.equal(900);
      expect(await token.balanceOf(buyer.address)).to.equal(100);
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
      const initialOwnerBalance = await token.balanceOf(owner.address);

      await expect(
        token.transfer(buyer.address, 10000)
      ).to.be.revertedWithoutReason();

      expect(await token.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("Should update allowance", async function () {
      await token.approve(buyer.address, 100);
      expect(await token.allowance(owner.address, buyer.address)).to.equal(100);
    });

    it("Should transfer tokens from one account to another with allowance", async function () {
      await token.approve(buyer.address, 100);
      await token.transferFrom(owner.address, buyer.address, 100);

      expect(await token.balanceOf(owner.address)).to.equal(900);
      expect(await token.balanceOf(buyer.address)).to.equal(100);
      expect(await token.allowance(owner.address, buyer.address)).to.equal(0);
    });

    it("Should fail if sender doesn’t have enough allowance", async function () {
      await token.approve(buyer.address, 99);

      await expect(
        token.transferFrom(owner.address, buyer.address, 100)
      ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
    });
  });
});
