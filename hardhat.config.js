require("@nomicfoundation/hardhat-toolbox"); // Hardhat 官方工具包（包含 Ethers、Waffle 等）
require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy");
require("hardhat-deploy-ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  // 命名账户配置（通过索引或别名映射账户地址）
  namedAccounts: {
    firstAccount: {
      default: 0, // 默认使用 accounts[0]（即 PRIVATE_KEY 对应的账户）
    }, secondAccount: {
      default: 1, // 默认使用 accounts[1]（即 PRIVATE_KEY2 对应的账户）
    }
  },
};
