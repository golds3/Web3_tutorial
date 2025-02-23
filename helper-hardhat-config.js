const LOCK_TIME = 180; //窗口时间为180秒
const AGG_DECIMALS = 8; //chainlink对usd的fee精度是10**8
const INITIAL_ANSWER = 2000 * 10**AGG_DECIMALS; //mock 预言机初始返回值
const devlopmentChains = ["hardhat", "local"]; //开发环境网络
const CONFIRMATIONS = 5; //测试网络确认区块数
const networkConfig = {
    // sepolia
    11155111: {
        ethUsdDataFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    },
    // bnb testnet
    97: {
        ethUsdDataFeed: "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7"
    }
}

module.exports = {
    LOCK_TIME,
    AGG_DECIMALS,
    INITIAL_ANSWER,
    devlopmentChains,
    networkConfig,
    CONFIRMATIONS
}