//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
//众筹 （反向供应链）
// 1. 创建一个收款函数
// 2. 计入投资人并查看
// 3. 在锁定期内，达到目标值，生产商可以提款
// 4. 在锁定期内，没有达到目标值，投资人在锁定期后进行退款
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol"; //这是chainlink提供等预言机

contract FundMe{
    AggregatorV3Interface public dataFeed;

    address public  owner;

    uint256 deployTime;
    uint256 period; //锁定时间
    bool public getFundSuccess  = false;

    // 0x694AA1769357215DE4FAC081bf1f309aDC325306 是Sepolia 测试网等地址
    constructor(uint256 _period,address _dataFeed) {
        dataFeed = AggregatorV3Interface(
            _dataFeed
        );
        owner = msg.sender;  //构造器只会执行一次，这一次的sender肯定就是部署合约的这个人，作为owner
        deployTime = block.timestamp;
        period = _period;
    }

    // 更改合约的主人
    function transferOwnerShip(address newOwner) public {
        require(msg.sender==owner, "only owner can call ");
        owner = newOwner;
    }


    //投资人 ： 投资金额
    mapping (address=>uint256) public fundersToAmount;

    uint256 MININUM_VALUE = 1*10**18; //10^18 wei. (100 usd)


    // payable --- 收取原生token (wei eth这些叫原生token，而不是usd rmb) 标识这个函数可以收费
    function fund() external payable  windowOpen{
        require(converEthToUSD(msg.value)>=MININUM_VALUE, "at leaset 1USD");
        fundersToAmount[msg.sender] += msg.value;
    }



    /**
     * Returns the latest answer.
     */
    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        // dataFeed.latestRoundData() 返回还不是usd的价格，需要除以（usd的精度）10 ** 8才是USD
        return answer/10**8;
    }

    function converEthToUSD(uint256 ethAmount) internal  view returns (uint256){
        // getChainlinkDataFeedLatestAnswer = 2738 既 1 eth = 2738 usd
        // require 美元>100  (>MININUM_VALUE)
        // 则需要把输入的eth转换为美元去比较
        // 即 ethAmount * 2738 >MININUM_VALUE 
        // 那么为什么MININUM_VALUE 不是设置为100 而是100*10**18呢
        // 因为传过来的eth ethAmount 他说以wei的单位即 ethAmount = ethAmountInput*10**18，因此MININUM_VALUE也应该如此
        uint256 usdPrice = ethAmount * uint256(getChainlinkDataFeedLatestAnswer());
        return usdPrice;

    }

    // 常量，不允许修改
    uint256 constant TARGET = 10 *10**18; // usd

    //当余额达到目标的时候，合约的所有者可以提取出来
    function getFund() external windowClose{
        require(msg.sender==owner, "only owner can call ");
        //当前合约的地址。address(this). balance 是合约的余额 ，ethh
        require(converEthToUSD(address(this).balance) >=TARGET, "target  is not reached"); 
        // transfer --- 纯转账 
        // payable(owner).transfer(address(this).balance);
        // send --- 纯转账 会返回转账结果 true - 成功 false 失败
        // bool result = payable(owner).send(address(this).balance);
        // require(result, "transfer failed");
        // call --- 纯转账+数据操作 ---建议都用这个方法进行转账
        // without data body.  ---("") 这里面可以写body。  
        // (success,result) 第一个返回值--支付结果，第二个返回值，调用body写的方法得到的响应，如果不关注某个返回，就不写变量去接收
        bool success;
        (success,)=payable(owner).call{value:address(this).balance}("");
        require(success, "transfer err");
        //owener 提完款后，也要把owner的捐赠金额请0
        fundersToAmount[owner] = 0;
        getFundSuccess = true;
    }


    // 规定时间未达到target，捐赠者可以进行退款
    function refund() external windowClose {
        require(address(this).balance < TARGET, "target is reached");
        uint256 senderAmt = fundersToAmount[msg.sender];
        require(senderAmt!=0, "no moeny to refund");
        //deduct 
        fundersToAmount[msg.sender] = 0;
        bool success;
        (success,) = payable(msg.sender).call{value: senderAmt}("");
        if (!success){
            fundersToAmount[msg.sender] = senderAmt;
        }
        require(success,"refund err");
    }

    modifier windowOpen(){
        require(block.timestamp<deployTime+period,"not in  window");
        _; //windowOpen写在某个方法上，在执行这个方法前会执行_;上面的内容，然后才开始执行方法
    }

        modifier windowClose(){
        require(block.timestamp>deployTime+period,"not in  window");
        _; 
    }

    address erc20;

    function setErc20Address(address _erc20) external {
        require(msg.sender == owner,"only owner can call");
        erc20 = _erc20;
    }

    // 允许外部合约FundTokenERC20 进行调用，扣减用户余留金额
    function setFunderToAmount(address funder,uint256 value) external {
        //只允许某个制定的合约调用
        require(erc20==msg.sender, "no permission to call");
        fundersToAmount[funder] = value;

    }
}