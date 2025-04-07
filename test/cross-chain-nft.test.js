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
})

// source chain -> dest chain
describe("source chain -> dest chain", async function () {
    // 测试用户是否可以从NFT合约中铸造NFT
    it("test if user can mint a nft from nft contract", async function () {
        // 调用nft合约的safeMint方法，为firstAccount铸造NFT
        await nft.safeMint(firstAccount);
        // 查询NFT的拥有者
        const owner = await nft.ownerOf(0);
        // 断言该NFT的拥有者是firstAccount
        await expect(owner).to.equal(firstAccount);
    });
    // 测试用户是否可以在源链上将NFT锁定在池中
    it("test if  user can lock the nft in the pool on source chain", async function () {
        // 调用nft合约的approve方法，允许nftPoolLockAndRelease合约操作NFT
        await nft.approve(nftPoolLockAndRelease.target, 0)
        // 从水龙头请求1000个LINK代币，为nftPoolLockAndRelease合约提供资金
        await CCIPLocalSimulator.requestLinkFromFaucet(nftPoolLockAndRelease, ethers.parseEther("1000"))
        // 调用nftPoolLockAndRelease合约的lockAndSendNFT方法，将NFT锁定并发送到目标链
        await nftPoolLockAndRelease.lockAndSendNFT(0, firstAccount, chainSelector, nftPoolBurnAndMint.target);

        // 查询NFT的新拥有者
        const newOwner = await nft.ownerOf(0);
        // 断言NFT的新拥有者是nftPoolLockAndRelease合约
        await expect(newOwner).to.equal(nftPoolLockAndRelease.target);
    });
    // 测试用户是否可以在目标链上获得包装后的NFT
    it("test if user can get a wrapped nft in dest chain", async function () {
        // 查询包装后的NFT的拥有者
        const newOwner = await wnft.ownerOf(0);
        // 断言该包装后的NFT的拥有者是firstAccount
        await expect(newOwner).to.equal(firstAccount);
    });
})

// source chain <- dest chain
describe("source chain <- dest chain", async function () {
    // 测试用户是否可以在目标链上燃烧包装后的NFT并发送CCIP消息
    it("test if user can burn the wnft and send ccip msg on dest chain", async function () {
        // 调用wnft合约的approve方法，允许nftPoolBurnAndMint合约操作包装后的NFT
        await wnft.approve(nftPoolBurnAndMint.target, 0)
        // 从水龙头请求1000个LINK代币，为nftPoolBurnAndMint合约提供资金
        await CCIPLocalSimulator.requestLinkFromFaucet(nftPoolBurnAndMint, ethers.parseEther("1000"))
        // 调用nftPoolBurnAndMint合约的burnAndSendNFT方法，燃烧包装后的NFT并发送消息到源链
        await nftPoolBurnAndMint.burnAndSendNFT(0, firstAccount, chainSelector, nftPoolLockAndRelease.target);

        // 查询包装后的NFT的总供应量
        const totalSupply = await wnft.totalSupply()
        // 断言包装后的NFT的总供应量为0，表示NFT已被燃烧
        await expect(totalSupply).to.equal(0);
    });

    // 测试用户是否可以在源链上解锁NFT
    it("test if user have the nft unlocked on source chain", async function () {
        // 查询NFT的拥有者
        const owner = await nft.ownerOf(0);
        // 断言该NFT的拥有者是firstAccount，表示NFT已解锁
        await expect(owner).to.equal(firstAccount);
    });
})