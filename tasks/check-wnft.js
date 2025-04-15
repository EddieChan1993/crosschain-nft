const {task} = require("hardhat/config");
//npx hardhat check-nft --network amoy
task("check-wnft").setAction(async (taskArgs, hre) => {
    const {firstAccount} = await getNamedAccounts();
    const wnft = await ethers.getContract("WrappedMyToken", firstAccount);
    const totalSupply = await wnft.totalSupply()
    console.log("checking status wft")
    for (let i = 0; i < totalSupply; i++) {
        const tokenId = await wnft.tokenByIndex(i);
        const owner = await wnft.ownerOf(tokenId);
        console.log("Token", tokenId, "Owner", owner);
    }
});

module.exports = {}