const {network} = require("hardhat");
const {devChains, networkConfig} = require("../hardhat.config.help.js");//npx hardhat deploy --network amoy --tags destchain
//npx hardhat deploy --network sepolia --tags sourcechain
module.exports = async ({getNamedAccounts, deployments}) => {
    const {firstAccount} = await getNamedAccounts();
    const {deploy, log} = deployments;
    let sourceChainRoute
    let linkToken
    log("Deploying NFTPoolLockAndRelease contract")
    if (devChains.includes(network.name)) {
        const mockCCIPSimulator = await deployments.get("CCIPLocalSimulator");
        ccipSimulator = await ethers.getContractAt("CCIPLocalSimulator",
            mockCCIPSimulator.address // 合约部署地址
        );
        const ccipConfig = await ccipSimulator.configuration();
        sourceChainRoute = ccipConfig.sourceRouter_;
        linkToken = ccipConfig.linkToken_;
    } else {
        sourceChainRoute = networkConfig[network.config.chainId].router
        linkToken = networkConfig[network.config.chainId].linkToken
    }
    const myToken = await deployments.get("MyToken");
    nftAddr = myToken.address
    await deploy("NFTPoolLockAndRelease", {
        contract: "NFTPoolLockAndRelease", from: firstAccount,
        args: [sourceChainRoute, linkToken, nftAddr],
        log: true
    });
    log("Deploying NFTPoolLockAndRelease success!")
};

module.exports.tags = ["all", "sourcechain"];