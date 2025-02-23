//部署fundme 合约脚本
const {LOCK_TIME} =  require("../helper-hardhat-config");
module.exports = async function({getNamedAccounts,deployments}){
    const {acct1} = await getNamedAccounts();
    const {deploy} = deployments;

    let confirmations = 0; //本地无需等待区块
    
    const fundMe = await deploy("FundMe",{
        from:acct1,
        args:[LOCK_TIME],
        log:true,
        waitConfirmations: confirmations
    })

    console.log("Network is not sepolia, verification skipped...")
}

module.exports.tags = ["all","fundme"];

