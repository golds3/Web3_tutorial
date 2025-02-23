//使用mocha 框架
const {deployments,getNamedAccounts, ethers,network} = require("hardhat");
const {assert} = require("chai")
const {devlopmentChains} = require("../../helper-hardhat-config")
// 如果不是开发环境，则跳过测试
!devlopmentChains.includes(network.name)?describe.skip
:describe("test fundme contract",async function(){
    let acct1;
    let acct2;
    let fundMe;
    let mockV3Aggregator;
    //合约部署
    beforeEach(async function(){
        //部署所有tag 包含all 的合约 
        await deployments.fixture("all");
        acct1 = (await getNamedAccounts()).acct1;
        acct2 = (await getNamedAccounts()).acct2;
        const fundMeDeployment = await deployments.get("FundMe");
        fundMe = await ethers.getContractAt("FundMe",fundMeDeployment.address);
        mockV3Aggregator = await deployments.get("MockV3Aggregator");
    })

    //测试场景1 
    it("test if the owner is msg.sender",async function(){
        const owner = await fundMe.owner();
        assert.equal(owner,acct1); //默认是acct1 部署合约
    })

    //测试场景2 
    it("test if the datafeed is assigned correctly",async function(){
        const dataFeed = await fundMe.dataFeed();
        console.log("contract dataFeed",dataFeed);
        assert.equal(dataFeed,mockV3Aggregator.address);
    })

})