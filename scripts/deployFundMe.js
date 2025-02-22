const {ethers} = require("hardhat");

async function main() {
    //create factory
    const funeMeFactory = await ethers.getContractFactory("FundMe");
    //deploy contract from factory
    console.log("Deploying FundMe contract...");
    const fundMe = await funeMeFactory.deploy(100);
    await fundMe.waitForDeployment();
    console.log("FundMe deployed success, contract address:", fundMe.target);

    //当部署在sepolia测试网络时，进行合约验证
    if(hre.network.config.chainId === 11155111 && process.env.ETHERSCAN_API){
        await fundMe.deploymentTransaction().wait(5);
        console.log("wait for 5 confirmations"); //部署成功后，等待5个区块时间，
        // 因为etherscan.io需要时间来更新收录合约，不然直接去调用它来验证的话可以能它还没有收录合约，导致验证失败
        //合约部署完后进行合约验证，不用再去用命令行 npx hardhat verify 单独执行了
        await verifyFundMe(fundMe.target, [100]);
    }else{
        console.log("skipping verification: hardhat network is not sepolia");
    }

}

async function verifyFundMe(fundMeAddress,args){
    //run 其实就是执行命令行命令
    await hre.run("verify:verify", {
        address: fundMeAddress,
        constructorArguments: args,
      });
}

main().catch((error)=>{
    console.error(error);
    process.exit(0);
})