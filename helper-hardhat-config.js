const LOCK_TIME = 180; //窗口时间为180秒
const AGG_DECIMALS = 8; //chainlink对usd的fee精度是10**8
const INITIAL_ANSWER = 2000 * 10**AGG_DECIMALS; //mock 预言机初始返回值
const devlopmentChains = ["hardhat", "local"] //开发环境网络
module.exports = {
    LOCK_TIME,
    AGG_DECIMALS,
    INITIAL_ANSWER,
    devlopmentChains
}