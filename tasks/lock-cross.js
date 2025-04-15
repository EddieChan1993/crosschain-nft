/**
 * @file 这是一个 Hardhat 自定义任务脚本，用于执行跨链 NFT 锁定和跨链消息发送操作
 * @dev 任务名称: lock-cross
 * 典型使用方式:
 * npx hardhat lock-cross --network sepolia --tokenid 0
 * 或指定目标链参数:
 * npx hardhat lock-cross --network sepolia --tokenid 0 --chainselector 123 --receiver 0x...
 */

const { task } = require("hardhat/config");
const { networkConfig } = require("../hardhat.config.help.js"); // 导入网络配置

task("lock-cross")
    .addOptionalParam("chainselector", "目标链的 Chainlink 链标识符") // 可选参数：目标链选择器
    .addOptionalParam("receiver", "目标链上接收合约的地址")          // 可选参数：接收合约地址
    .addParam("tokenid", "要进行跨链操作的 NFT Token ID")          // 必填参数：NFT ID
    .setAction(async (taskArgs, hre) => {
        // ------------------------------
        // 步骤 1: 配置目标链参数
        // ------------------------------
        let destChainSelector;
        let receiver;

        // 如果未指定 chainselector，使用默认配置（这里硬编码了 80002 链的配置，建议优化为动态获取）
        if (taskArgs.chainselector) {
            destChainSelector = taskArgs.chainselector;
        } else {
            destChainSelector = networkConfig[80002].chainSelector; // 假设 80002 是目标链的网络ID
        }

        // 如果未指定 receiver，通过伴生网络获取部署的合约地址
        if (taskArgs.receiver) {
            receiver = taskArgs.receiver;
        } else {
            // 从伴生网络（如目标链）获取部署的接收合约地址
            const nftPoolBurnAndMintDeploy = await hre.companionNetworks["destChain"].deployments.get("NFTPoolBurnAndMint");
            receiver = nftPoolBurnAndMintDeploy.address;
        }

        // ------------------------------
        // 步骤 2: 初始化账户和合约
        // ------------------------------
        const { firstAccount } = await getNamedAccounts(); // 获取预配置的账户

        // 获取 LINK 代币合约实例
        const linkTokenAddr = networkConfig[network.config.chainId].linkToken;
        const linkToken = await ethers.getContractAt(
            "LinkToken", // 合约名称（需确保 ABI 匹配）
            linkTokenAddr
        );

        const tokenId = taskArgs.tokenid; // 要跨链的 NFT ID

        // ------------------------------
        // 步骤 3: 准备跨链资金（LINK）
        // ------------------------------
        const nftPool = await ethers.getContract("NFTPoolLockAndRelease", firstAccount);

        // 向跨链合约转入 5 LINK 作为手续费（建议金额动态化）
        const transTx = await linkToken.transfer(nftPool.target, ethers.parseEther("5"));
        await transTx.wait(6); // 等待 6 个区块确认（可能需根据网络调整）

        // 验证余额
        const balance = await linkToken.balanceOf(nftPool.target);
        console.log(`合约 ${nftPool.target} 的 LINK 余额: ${balance}`);

        // ------------------------------
        // 步骤 4: 授权 NFT 操作权限
        // ------------------------------
        const nft = await ethers.getContract("MyToken", firstAccount);
        await nft.approve(nftPool.target, tokenId); // 授权跨链合约操作 NFT
        console.log("NFT 授权成功");

        // ------------------------------
        // 步骤 5: 执行跨链锁定操作
        // ------------------------------
        console.log("跨链参数:", tokenId, firstAccount, destChainSelector, receiver);
        const lockAndSendNFTTx = await nftPool.lockAndSendNFT(
            tokenId,
            firstAccount,  // 这里可能需要验证参数是否应为 newOwner 地址
            destChainSelector,
            receiver
        );
        console.log("跨链交易哈希:", lockAndSendNFTTx.hash);
    });

module.exports = {};