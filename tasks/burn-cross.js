/**
 * @file Hardhat 自定义任务脚本：执行跨链销毁 NFT 并发送跨链消息
 * @dev 任务名称: burn-cross
 * 使用示例:
 * npx hardhat burn-cross --network amoy --tokenid 0
 * 或指定参数:
 * npx hardhat burn-cross --network amoy --tokenid 0 --chainselector 123 --receiver 0x...
 */

const { task } = require("hardhat/config");
const { networkConfig } = require("../hardhat.config.help.js"); // 网络配置

task("burn-cross")
    .addOptionalParam("chainselector", "目标链的 Chainlink 链标识符") // 可选参数
    .addOptionalParam("receiver", "目标链接收合约地址")              // 可选参数
    .addParam("tokenid", "要跨链的 NFT Token ID")                  // 必填参数
    .setAction(async (taskArgs, hre) => {
        // ------------------------------
        // 步骤 1: 配置目标链参数
        // ------------------------------
        let destChainSelector;
        let receiver;

        // 目标链选择器处理（硬编码 11155111 需确认是否为正确的目标链ID）
        if (taskArgs.chainselector) {
            destChainSelector = taskArgs.chainselector;
        } else {
            destChainSelector = networkConfig[11155111].chainSelector; // 假设 11155111 是 Sepolia 测试网
        }

        // 接收地址处理（依赖伴生网络配置）
        if (taskArgs.receiver) {
            receiver = taskArgs.receiver;
        } else {
            // 从伴生网络获取部署的合约地址（需确保 "destChain" 网络已配置）
            const destContractIns = await hre.companionNetworks["destChain"].deployments.get("NFTPoolLockAndRelease");
            receiver = destContractIns.address;
        }

        // ------------------------------
        // 步骤 2: 初始化账户和合约
        // ------------------------------
        const { firstAccount } = await getNamedAccounts(); // 获取配置的默认账户

        // 获取 LINK 代币合约实例（需确保网络配置正确）
        const linkTokenAddr = networkConfig[network.config.chainId].linkToken;
        const linkToken = await ethers.getContractAt(
            "LinkToken", // 合约 ABI 名称
            linkTokenAddr
        );

        const tokenId = taskArgs.tokenid; // 要操作的 NFT ID

        // ------------------------------
        // 步骤 3: 准备跨链资金（LINK）
        // ------------------------------
        const nftPool = await ethers.getContract("NFTPoolBurnAndMint", firstAccount);

        // 向合约转账 5 LINK（建议金额动态化）
        const transTx = await linkToken.transfer(nftPool.target, ethers.parseEther("5"));
        await transTx.wait(6); // 等待 6 个区块确认（可能需调整）

        // 验证余额（建议添加错误处理）
        const balance = await linkToken.balanceOf(nftPool.target);
        console.log(`合约 ${nftPool.target} LINK 余额: ${balance}`);

        // ------------------------------
        // 步骤 4: 授权 Wrapped NFT 操作权限
        // ------------------------------
        const nft = await ethers.getContract("WrappedMyToken", firstAccount);
        await nft.approve(nftPool.target, tokenId); // 授权跨链合约操作 NFT
        console.log("Wrapped NFT 授权成功");

        // ------------------------------
        // 步骤 5: 执行跨链销毁操作
        // ------------------------------
        console.log("跨链参数:", tokenId, firstAccount, destChainSelector, receiver);
        const nftTx = await nftPool.burnAndSendNFT(
            tokenId,
            firstAccount,   // 注意：这里可能是目标链接收地址，需确认参数设计
            destChainSelector,
            receiver
        );
        console.log("跨链销毁交易哈希:", nftTx.hash);
    });

module.exports = {};