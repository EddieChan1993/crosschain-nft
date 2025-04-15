// 部署脚本主逻辑，Hardhat 会自动调用此函数
//npx hardhat deploy --network amoy --tags destchain
module.exports = async ({getNamedAccounts, deployments}) => {
    // 1. 获取配置中定义的命名账户（在 hardhat.config.js 的 namedAccounts 中配置）
    const {firstAccount} = await getNamedAccounts();

    // 2. 获取部署方法（来自 hardhat-deploy 插件）
    const {deploy, log} = deployments;
    log("Deploying WrappedMyToken contract")

    // 3. 执行部署动作：部署名为 "MockV3Aggregator" 位价合约
    await deploy("WrappedMyToken", {
        contract: "WrappedMyToken",
        from: firstAccount,    // 使用 firstAccount 地址作为部署者
        args: ["WHatToken", "WHT"],// 合约构造函数的参数
        log: true               // 打印部署日志（方便调试）
    });
    log("Deploying WrappedMyToken success!")
}

// 4. 定义部署标签（tags），用于选择性部署
// 执行 `npx hardhat deploy` 会部署所有带 "all" 标签的脚本
// 执行 `npx hardhat deploy --tags fundme` 仅部署当前脚本
module.exports.tags = ["all", "destchain"];