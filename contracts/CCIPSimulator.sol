// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
//这段代码的作用是导入 Chainlink 的本地 CCIP mock合约（模拟合约），主要用于在本地开发环境中模拟跨链交互
pragma solidity ^0.8.22;
//https://docs.chain.link/chainlink-local
//https://github.com/smartcontractkit/chainlink-local
import {CCIPLocalSimulator} from "@chainlink/local/src/ccip/CCIPLocalSimulator.sol";