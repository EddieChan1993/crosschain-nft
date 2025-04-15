//npx hardhat deploy --network sepolia --tags sourcechain
module.exports = async ({getNamedAccounts, deployments}) => {
    const {firstAccount} = await getNamedAccounts();
    const {deploy, log} = deployments;
    log("Deploying nft contract")
    await deploy("MyToken", {
        contract: "MyToken",
        from: firstAccount,
        args: ["HatToken", "HT"],
        log: true
    });
    log("Deploying nft success!")
}
module.exports.tags = ["all", "sourcechain"];