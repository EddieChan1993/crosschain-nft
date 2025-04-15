const {task} = require("hardhat/config");
const {networkConfig} = require("../hardhat.config.help.js")
//npx hardhat lock-cross --network sepolia --tokenid 0
task("lock-cross")
    .addOptionalParam("chainselector", "chain selector to dest chain")
    .addOptionalParam("receiver", "receiver address")
    .addParam("tokenid", "token Id to be crossed chain")
    .setAction(async (taskArgs, hre) => {
        let destChainSelector;
        let receiver;
        if (taskArgs.chainselector) {
            destChainSelector = taskArgs.chainselector;
        } else {
            destChainSelector = networkConfig[80002].chainSelector;
        }
        if (taskArgs.receiver) {
            receiver = taskArgs.receiver;
        } else {
            const nftPoolBurnAndMintDeploy = await hre.companionNetworks["destChain"].deployments.get("NFTPoolBurnAndMint")
            receiver = nftPoolBurnAndMintDeploy.address
        }
        const {firstAccount} = await getNamedAccounts();
        const linkTokenAddr = networkConfig[network.config.chainId].linkToken
        const linkToken = await ethers.getContractAt("LinkToken", // 合约名称
            linkTokenAddr);
        const tokenId = taskArgs.tokenid

        const nftPool = await ethers.getContract("NFTPoolLockAndRelease", firstAccount);
        const transTx = await linkToken.transfer(nftPool.target, ethers.parseEther("5"));
        await transTx.wait(6);
        const balance = await linkToken.balanceOf(nftPool.target)
        console.log(`${nftPool.target} ${balance}`)

        const nft = await ethers.getContract("MyToken", firstAccount);
        await nft.approve(nftPool.target, tokenId)
        console.log("approve success");

        console.log(tokenId, firstAccount, destChainSelector, receiver)
        const lockAndSendNFTTx = await nftPool.lockAndSendNFT(tokenId, firstAccount, destChainSelector, receiver);
        console.log("lockAndSendNFT", lockAndSendNFTTx.hash);
    });

module.exports = {}