// 部署脚本主逻辑，Hardhat 会自动调用此函数
const {network} = require("hardhat");
const {devChains, networkConfig} = require("../hardhat.config.help.js");//npx hardhat deploy --network amoy --tags destchain
//npx hardhat deploy --network sepolia --tags sourcechain
module.exports = async ({getNamedAccounts, deployments}) => {
    // 1. 获取配置中定义的命名账户（在 hardhat.config.js 的 namedAccounts 中配置）
    const {firstAccount} = await getNamedAccounts();
    // 2. 获取部署方法（来自 hardhat-deploy 插件）
    const {deploy, log} = deployments;
    let sourceChainRoute
    let linkToken
    log("Deploying NFTPoolLockAndRelease contract")
    if (devChains.includes(network.name)) {
        // 使用 Hardhat 的 deployments 插件获取名为 "MockV3Aggregator" 的已部署模拟合约实例
        const mockCCIPSimulator = await deployments.get("CCIPLocalSimulator");
        //获取已经部署的合约实例
        ccipSimulator = await ethers.getContractAt("CCIPLocalSimulator", // 合约名称
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
    // 3. 执行部署动作：部署名为 "MockV3Aggregator" 位价合约
    await deploy("NFTPoolLockAndRelease", {
        contract: "NFTPoolLockAndRelease", from: firstAccount,    // 使用 firstAccount 地址作为部署者
        args: [sourceChainRoute, linkToken, nftAddr],// 合约构造函数的参数
        log: true               // 打印部署日志（方便调试）
    });
    log("Deploying NFTPoolLockAndRelease success!")
};

// 4. 定义部署标签（tags），用于选择性部署
// 执行 `npx hardhat deploy` 会部署所有带 "all" 标签的脚本
// 执行 `npx hardhat deploy --tags fundme` 仅部署当前脚本
module.exports.tags = ["all", "sourcechain"];