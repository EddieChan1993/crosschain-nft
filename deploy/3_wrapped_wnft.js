//npx hardhat deploy --network amoy --tags destchain
module.exports = async ({getNamedAccounts, deployments}) => {
    const {firstAccount} = await getNamedAccounts();
    const {deploy, log} = deployments;
    log("Deploying WrappedMyToken contract")
    await deploy("WrappedMyToken", {
        contract: "WrappedMyToken", from: firstAccount,
        args: ["WHatToken", "WHT"],
        log: true
    });
    log("Deploying WrappedMyToken success!")
}
module.exports.tags = ["all", "destchain"];