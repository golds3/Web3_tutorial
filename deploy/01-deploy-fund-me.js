//部署fundme 合约脚本
const { network } = require("hardhat")
const {LOCK_TIME,devlopmentChains} =  require("../helper-hardhat-config");
module.exports = async function({getNamedAccounts,deployments}){
    const {acct1} = await getNamedAccounts();
    const {deploy} = deployments;

    let confirmations; 
    let dataFeedAddr;
    if(devlopmentChains.includes(network.name)){
        const mockV3Aggregator = await deployments.get("MockV3Aggregator")    
        dataFeedAddr = mockV3Aggregator.address;
        confirmations = 0; //本地无需等待区块
    }else{
        // donothing -- todo
    }
    
    const fundMe = await deploy("FundMe",{
        from:acct1,
        args:[LOCK_TIME,dataFeedAddr],
        log:true,
        waitConfirmations: confirmations
    })

    console.log("Network is not sepolia, verification skipped...")
}

module.exports.tags = ["all","fundme"];

