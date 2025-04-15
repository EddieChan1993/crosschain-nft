const {devChains, networkConfig} = require("../hardhat.config.help.js")
const {network} = require("hardhat");
//npx hardhat deploy --network amoy --tags destchain
module.exports = async ({getNamedAccounts, deployments}) => {
    const {firstAccount} = await getNamedAccounts();
    const {deploy, log} = deployments;
    let destChainRoute
    let linkToken

    log("Deploying NFTPoolBurnAndMint contract")
    if (devChains.includes(network.name)) {
        const mockCCIPSimulator = await deployments.get("CCIPLocalSimulator");
        ccipSimulator = await ethers.getContractAt("CCIPLocalSimulator", mockCCIPSimulator.address);
        const ccipConfig = await ccipSimulator.configuration();
        destChainRoute = ccipConfig.destinationRouter_;
        linkToken = ccipConfig.linkToken_;
    } else {
        destChainRoute = networkConfig[network.config.chainId].router
        linkToken = networkConfig[network.config.chainId].linkToken
    }
    const myToken = await deployments.get("WrappedMyToken");
    await deploy("NFTPoolBurnAndMint", {
        contract: "NFTPoolBurnAndMint",
        from: firstAccount,
        args: [destChainRoute, linkToken, myToken.address],
        log: true
    });
    log("Deploying NFTPoolBurnAndMint success!")
};

module.exports.tags = ["all", "destchain"];