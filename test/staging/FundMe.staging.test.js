// 集成测试
const {devlopmentChains} = require("../../helper-hardhat-config")
const {network} = require("hardhat")
const {expect,assert} = require("chai")
// 只测试 fund getfund refund 这些重要函数的组合测试
devlopmentChains.includes(network.name) ? 
describe.skip : 
describe("test fundme contract staging",async function(){
    let acct1;
    let acct2;
    let fundMe;
    let acct2FundMe;
    //合约部署
    beforeEach(async function () {
        //部署所有tag 包含all 的合约 
        await deployments.fixture("all");
        acct1 = (await getNamedAccounts()).acct1;
        acct2 = (await getNamedAccounts()).acct2;
        const fundMeDeployment = await deployments.get("FundMe");
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address);
        const signerAcct2 = await ethers.getSigner(acct2);
        acct2FundMe = fundMe.connect(signerAcct2);
    })

     it("fund and getFund success",async function(){
        await fundMe.fund({value: ethers.parseEther("0.005")}) // 0.005 *2700
        // make sure the window is closed
        await new Promise(resolve => setTimeout(resolve, 181 * 1000));
        const getFundTx = await fundMe.getFund();
        const getFundReceipt = await getFundTx.wait();
        const balance = await fundMe.fundersToAmount(acct1);
        assert.equal(balance, ethers.parseEther("0"));
     })
        
})