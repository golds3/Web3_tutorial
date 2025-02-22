const {task} = require("hardhat/config");
// 创建一个名字为interact-fundMe的任务，并设置任务的描述为"interact with fundme contract"，
// 功能上，它将调用FundMe合约的函数，并打印结果。
task("interact-fundMe","interact with fundme contract")
.addParam("addr","the address of the fundme contract")
.setAction(async(taskArgs,hre)=>{
    const fundMeFactory = await ethers.getContractFactory("FundMe");
    //atch 函数，hardhat会把合约的地址转换为合约实例
    const fundMe = await fundMeFactory.attach(taskArgs.addr);
    // init two accounts
    const [acct1,acct2] = await ethers.getSigners();
    //acct1 do fund 0.0005 eth  (1.几 的usd)
    const fundTx1 = await fundMe.fund({value:ethers.parseEther("0.0005")});
    await fundTx1.wait();
    // check the balance of the fundMe contract
    const balance = await ethers.provider.getBalance(fundMe.target);
    console.log("fundMe balance: ", ethers.formatEther(balance));

    //acct2 do fund 0.0005 eth
    const fundTx2 = await fundMe.connect(acct2).fund({value:ethers.parseEther("0.0005")});
    await fundTx2.wait();

    // check the balance of the fundMe contract
    const balance2 = await ethers.provider.getBalance(fundMe.target);
    console.log("fundMe balance: ", ethers.formatEther(balance2));

    //check acct balance
    const acct1Balance = await fundMe.fundersToAmount(acct1.address);
    console.log("acct1 balance: ", ethers.formatEther(acct1Balance));

    const acct2Balance = await fundMe.fundersToAmount(acct2.address);
    console.log("acct2 balance: ", ethers.formatEther(acct2Balance));

    // //withdraw
    // const reFundTx = await fundMe.refund();
    // await reFundTx.wait();

    // //check the balance of the fundMe contract
    // const balance3 = await ethers.provider.getBalance(fundMe.target);
    // console.log("fundMe balance: ", ethers.formatEther(balance3));
    
    

    
})

module.exports = {}