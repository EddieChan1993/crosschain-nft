require("@nomicfoundation/hardhat-toolbox"); // Hardhat 官方工具包（包含 Ethers、Waffle 等）
require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
require("@chainlink/env-enc").config();
require(("./tasks"))

//使用加密变量
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL
const AMOY_RPC_URL = process.env.AMOY_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.28", namedAccounts: {
        firstAccount: {
            default: 0,
        }, secondAccount: {
            default: 1,
        }
    }, networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL, accounts: [PRIVATE_KEY], chainId: 11155111, blockConfirmations: 6,
        }, amoy: {
            url: AMOY_RPC_URL, accounts: [PRIVATE_KEY], chainId: 80002, blockConfirmations: 6,
        }
    }
};
