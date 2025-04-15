const {devChains} = require("../hardhat.config.help.js")
const {network} = require("hardhat");
module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy, log} = deployments;
    if (!devChains.includes(network.name)) {
        log("not in network", devChains)
        return;
    }
    const {firstAccount} = await getNamedAccounts();
    log("Deploying CCIPLocalSimulator contract")
    await deploy("CCIPLocalSimulator", {
        contract: "CCIPLocalSimulator", from: firstAccount, args: [], log: true
    });
    log("Deploying CCIPLocalSimulator success!")
};

module.exports.tags = ["all", "test"];