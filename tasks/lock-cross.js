const {task} = require("hardhat/config");
const {networkConfig} = require("../hardhat.config.help.js")
//npx hardhat check-nft --network sepolia
task("lock-cross")
    .addOptionalParam("chainselector", "chain selector to dest chain")
    .addOptionalParam("receiver", "receiver address")
    .addParam("tokenid", "token Id to be crossed chain")
    .setAction(async (taskArgs, hre) => {
        let chainSelector;
        let receiver;
        if (taskArgs.chainselector) {
            chainSelector = taskArgs.chainselector;
        } else {
            chainSelector = networkConfig[network.config.chainId].chainSelector;
        }
        if (taskArgs.receiver) {
            receiver = taskArgs.receiver;
        } else {
            const nftPoolBurnAndMintDeploy = hre.companionNetworks["destChain"].deployments.get("NFTPoolBurnAndMint")
            receiver = nftPoolBurnAndMintDeploy.address
        }
        //transfer link token to address of the pool
        const {firstAccount} = await getNamedAccounts();
        const linkTokenAddr = networkConfig[network.config.chainId].linkToken
        const linkToken = await ethers.getContractAt("LinkToken", // 合约名称
            linkTokenAddr);
        const tokenId = taskArgs.tokenid
        const nftPool = await ethers.getContract("NFTPoolLockAndRelease", firstAccount);
        const transTx = await linkToken.transfer(nftPool.target, ethers.parseEther("10"));
        await transTx.wait(6);
        const balance = await linkToken.balanceOf(nftPool.target)
        console.log(`${nftPool.target} ${balance}`)

        //approve pool addr to call transfer
        const nft = await ethers.getContract("MyToken", firstAccount);
        await nft.approve(nftPool.target, tokenId)
        console.log("approve success");

        //call lockAndSendNFT
        const lockAndSendNFTTx = await nftPool.lockAndSendNFT(tokenId, firstAccount, chainSelector, receiver);
        console.log("lockAndSendNFT", lockAndSendNFTTx.hash, msgId);
    });

module.exports = {}