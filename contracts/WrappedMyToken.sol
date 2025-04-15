// SPDX-License-Identifier: MIT
// 兼容 OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {MyToken} from "./MyToken.sol";

/**
 * @title WrappedMyToken
 * @dev 封装代币合约，继承自 MyToken（假设 MyToken 是 ERC721 实现）
 * 核心功能：允许通过指定 tokenId 铸造封装代币
 *
 * ⚠️ 当前实现存在严重安全隐患，需立即修复！
 */
contract WrappedMyToken is MyToken {
    /**
     * @dev 构造函数初始化代币名称和符号
     * @param tokenName 代币名称（如 "Wrapped MyNFT"）
     * @param tokenSymbol 代币符号（如 "WMT"）
     */
    constructor(
        string memory tokenName,
        string memory tokenSymbol
    ) MyToken(tokenName, tokenSymbol) {}

    function mintTokenWithTokenId(address to, uint256 tokenId) public {
        _safeMint(to, tokenId);
    }
}
