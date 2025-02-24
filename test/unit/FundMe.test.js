//使用mocha 框架
const { deployments, getNamedAccounts, ethers, network } = require("hardhat");
const { assert, expect } = require("chai")
const { devlopmentChains } = require("../../helper-hardhat-config")
const helpers = require("@nomicfoundation/hardhat-network-helpers")

// 如果不是开发环境，则跳过测试
!devlopmentChains.includes(network.name) ? describe.skip
    : describe("test fundme contract", async function () {
        let acct1;
        let acct2;
        let fundMe;
        let mockV3Aggregator;
        let acct2FundMe;
        //合约部署
        beforeEach(async function () {
            //部署所有tag 包含all 的合约 
            await deployments.fixture("all");
            acct1 = (await getNamedAccounts()).acct1;
            acct2 = (await getNamedAccounts()).acct2;
            const fundMeDeployment = await deployments.get("FundMe");
            fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address);
            mockV3Aggregator = await deployments.get("MockV3Aggregator");
            const signerAcct2 = await ethers.getSigner(acct2);
            acct2FundMe = fundMe.connect(signerAcct2);
        })

        //测试场景1 
        it("test if the owner is msg.sender", async function () {
            const owner = await fundMe.owner();
            assert.equal(owner, acct1); //默认是acct1 部署合约
        })

        //测试场景2 
        it("test if the datafeed is assigned correctly", async function () {
            const dataFeed = await fundMe.dataFeed();
            console.log("contract dataFeed", dataFeed);
            assert.equal(dataFeed, mockV3Aggregator.address);
        })
        // fund, getFund, refund
        // unit test for fund
        // window open, value greater then minimum value, funder balance
        it("window closed, value grater than minimum,fund failed", async function () {
            // make sure the window is closed
            await helpers.time.increase(200);
            await helpers.mine();
            //mock fee 1eth = 3000usd
            await expect(fundMe.fund({ value: ethers.parseEther("0.001") }))
                .to.be.revertedWith("not in  window");
        })
        it("window open, value is less than minimum, fund failed", async function () {
            //mock fee 1eth = 3000usd
            await expect(fundMe.fund({ value: ethers.parseEther("0.00001") }))
                .to.be.revertedWith("at leaset 1USD");
        })
        it("Window open, value is greater minimum, fund success", async function () {
            await fundMe.fund({ value: ethers.parseEther("0.1") })
            const balance = await fundMe.fundersToAmount(acct1);
            assert.equal(balance, ethers.parseEther("0.1"))
        })
        // unit test for getFund
        // onlyOwner, windowClose, target reached
        it("not onwer, window closed, target reached, getFund failed", async function () {
            // make sure  target reached
            await fundMe.fund({ value: ethers.parseEther("1") })
            await helpers.time.increase(200);
            await helpers.mine();
            // gedFund
            await expect(acct2FundMe.getFund())
                .to.be.revertedWith("only owner can call ");
        })

        it("window open, target reached, getFund failed", async function () {
            // make sure  target reached
            await fundMe.fund({ value: ethers.parseEther("1") })
            // gedFund
            await expect(fundMe.getFund())
                .to.be.revertedWith("not in  window");
        })
        it("window closed, target not reached, getFund failed", async function () {
            // make sure  target not reached
            await fundMe.fund({ value: ethers.parseEther("0.001") })
            await helpers.time.increase(200);
            await helpers.mine();
            // gedFund
            await expect(fundMe.getFund())
                .to.be.revertedWith("target  is not reached");
        })
        it("window closed, target reached, getFund success", async function () {
            // make sure  target reached
            await fundMe.fund({ value: ethers.parseEther("1") })
            await helpers.time.increase(200);
            await helpers.mine();
            // getFund
            await fundMe.getFund();
            const balance = await fundMe.fundersToAmount(acct1)
            assert.equal(balance, ethers.parseEther("0"));
        })

        //refund unit test
        it("window open, target not reached, refund failed", async function () {
            await fundMe.fund({ value: ethers.parseEther("0.001") })
            await expect(fundMe.refund())
            .to.be.revertedWith("not in  window");
        })
        it("window closed, target reached, refund failed", async function () {
            await fundMe.fund({ value: ethers.parseEther("0.01") })
            await helpers.time.increase(200);
            await helpers.mine();
            await expect(fundMe.refund()) 
                .to.be.revertedWith("target is reached");
        })

        it("window closed, target not reached,acct no money ,refund failed",async function(){
            await fundMe.fund({ value: ethers.parseEther("0.001") })
            await helpers.time.increase(200);
            await helpers.mine();
            await expect(acct2FundMe.refund())
                .to.be.revertedWith("no moeny to refund");
        })
        //window closed, target not reached, refund success
        it("window closed, target not reached, refund success", async function () {
            await fundMe.fund({ value: ethers.parseEther("0.001") })
            await helpers.time.increase(200);
            await helpers.mine();
            await fundMe.refund();
            const balance = await fundMe.fundersToAmount(acct1);
            assert.equal(balance, ethers.parseEther("0"));
        })
        
        
    })