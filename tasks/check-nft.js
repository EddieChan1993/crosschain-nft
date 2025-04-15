const {task} = require("hardhat/config");
//npx hardhat check-nft --network sepolia
task("check-nft").setAction(async (taskArgs, hre) => {
    const {firstAccount} = await getNamedAccounts();
    const nft = await ethers.getContract("MyToken", firstAccount);
    const totalSupply = await nft.totalSupply()
    console.log("checking status nft")
    for (let i = 0; i < totalSupply; i++) {
        const tokenId = await nft.tokenByIndex(i);
        const owner = await nft.ownerOf(tokenId);
        console.log("Token", tokenId, "Owner", owner);
    }
});

module.exports = {}