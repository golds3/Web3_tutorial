const {ethers} = require("hardhat");

async function main() {
    //create factory
    const funeMeFactory = await ethers.getContractFactory("FundMe");
    //deploy contract from factory
    console.log("Deploying FundMe contract...");
    const fundMe = await funeMeFactory.deploy(1000);
    await fundMe.waitForDeployment();
    console.log("FundMe deployed success, contract address:", fundMe.getAddress);
}

main().catch((error)=>{
    console.error(error);
    process.exit(0);
})