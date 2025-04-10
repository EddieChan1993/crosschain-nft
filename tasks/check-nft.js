const {task} = require("hardhat/config");
//npx hardhat check-nft --network sepolia
task("check-nft").setAction(async (taskArgs, hre) => {
    const {firstAccount} = await getNamedAccounts();
    const nft = await ethers.getContract("MyToken", firstAccount);
    const totalSupply = await nft.totalSupply()
    console.log("checking status nft")
    for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
        const owner = await nft.ownerOf(tokenId);
        console.log("Token", tokenId, "Owner", owner);
    }
});

module.exports = {}