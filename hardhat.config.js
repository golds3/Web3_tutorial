require("@nomicfoundation/hardhat-toolbox");
require("@chainlink/env-enc").config();
const SEPOLIA_URL = process.env.SEPOLIA_URL;
const SEPOLIA_ACCOUNT_PRIVATE_KEY = process.env.SEPOLIA_ACCOUNT_PRIVATE_KEY;
// 下面三行是为了设置代理 ，因为使用了clash翻墙 也可以不写，那么clash软件要开启tune（增强模式）
// const { ProxyAgent, setGlobalDispatcher } = require("undici");
// const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
// setGlobalDispatcher(proxyAgent);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  //默认就是hardhat
  // defaultNetwork: "hardhat", //设置网络为 in-process 模式，仅在需要与链交互的时候才创建短暂的网络
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [SEPOLIA_ACCOUNT_PRIVATE_KEY],
    },
  },
  etherscan:{
    apiKey: "VJUNECH7HRHCSG9UA6P3DAVTJJA4PKREJ7"
  }
};
