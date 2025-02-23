//预言机AggregatorV3Interface 需要上链才能调用，部署mock用于本地测试
const {AGG_DECIMALS,INITIAL_ANSWER} = require("../helper-hardhat-config");
module.exports = async function({getNamedAccounts, deployments}) {
    const {deploy} = deployments;
    const {acct1} = await getNamedAccounts();
    const MockV3Aggregator = await deploy("MockV3Aggregator",{
        from:acct1,
        args:[AGG_DECIMALS,INITIAL_ANSWER], //chainlink对usd的fee精度是10**8，返回设定为3000，即1eth = 3000usd
        log:true
    })
}

module.exports.tags = ["all","mock"];