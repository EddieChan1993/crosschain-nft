const {deployments, getNamedAccounts, ethers} = require("hardhat");
const {assert, expect} = require("chai"); // 断言库
let firstAccount;
let nft;
let CCIPLocalSimulator;
let nftPoolLockAndRelease;
let nftPoolBurnAndMint;
let wnft;
let chainSelector;

before(async function () {
//prepare variables:contract,account
    await deployments.fixture(["all"])
    firstAccount = (await getNamedAccounts()).firstAccount;
    nft = await ethers.getContract("MyToken", firstAccount);
    nftPoolLockAndRelease = await ethers.getContract("NFTPoolLockAndRelease", firstAccount);
    nftPoolBurnAndMint = await ethers.getContract("NFTPoolBurnAndMint", firstAccount);
    CCIPLocalSimulator = await ethers.getContract("CCIPLocalSimulator", firstAccount);
    wnft = await ethers.getContract("WrappedMyToken", firstAccount);
    const config = await CCIPLocalSimulator.configuration();
    chainSelector = config.chainSelector_;
    console.log(chainSelector);
    console.log(nftPoolBurnAndMint.target);
})

//source chain -> dest chain
describe("source chain -> dest chain", async function () {
    it("test if user can mint a nft from nft contract", async function () {
        await nft.safeMint(firstAccount);
        const owner = await nft.ownerOf(0);
        await expect(owner).to.equal(firstAccount);
    });
    it("test if  user can lock the nft in the pool on source chain", async function () {
        await nft.approve(nftPoolLockAndRelease.target, 0)
        await CCIPLocalSimulator.requestLinkFromFaucet(nftPoolLockAndRelease, ethers.parseEther("1000"))
        await nftPoolLockAndRelease.lockAndSendNFT(0, firstAccount, chainSelector, nftPoolBurnAndMint.target);

        const newOwner = await nft.ownerOf(0);
        await expect(newOwner).to.equal(nftPoolLockAndRelease.target);
    });
    it("test if user can get a wrapped nft in dest chain", async function () {
        const newOwner = await wnft.ownerOf(0);
        await expect(newOwner).to.equal(firstAccount);
    });
})

//source chain <- dest chain
describe("source chain <- dest chain", async function () {
    it("test if user can burn the wnft and send ccip msg on dest chain", async function () {
        await wnft.approve(nftPoolBurnAndMint.target, 0)
        await CCIPLocalSimulator.requestLinkFromFaucet(nftPoolBurnAndMint, ethers.parseEther("1000"))
        await nftPoolBurnAndMint.burnAndSendNFT(0, firstAccount, chainSelector, nftPoolLockAndRelease.target);

        const totalSupply = await wnft.totalSupply()
        await expect(totalSupply).to.equal(0);
    });

    it("test if user have the nft unlocked on source chain", async function () {
        const owner = await nft.ownerOf(0);
        await expect(owner).to.equal(firstAccount);
    });
})