// SPDX-License-Identifier: GPL-3.0
pragma solidity >= 0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract QuestFactory {
    event QuestCreated(address questAddress, string _content);
    address payable public aragonGovernAddress;

    constructor(address payable _aragonGovernAddress){
        aragonGovernAddress = _aragonGovernAddress;
    }

    function createQuest(string calldata _content,uint256 _terminationDate, address payable _fallbackAddress) external {
        Quest quest = new Quest(_content,_terminationDate,aragonGovernAddress,_fallbackAddress);
        emit QuestCreated(address(quest), _content);
    }
}

contract Quest {
    string public userFiles;
    string public content;
    address payable public aragonGovernAddress;
    address payable public fallbackAddress;
    uint256 public terminationDate;
    IERC20 public token;

    constructor(string memory _content,uint256 _terminationDate,address payable _aragonGovernAddress, address payable _fallbackAddress) public {
        content = _content;
        terminationDate = _terminationDate;
        aragonGovernAddress = _aragonGovernAddress;
        fallbackAddress = _fallbackAddress;
    }

    function returnFunds() external payable{
        require(terminationDate < block.timestamp, "Quest is not expired yet.");  
        token.transfer(fallbackAddress, token.totalSupply());
    }

    function recoverNativeTokens() external payable {
        token.transfer(fallbackAddress, token.totalSupply());
    }

    function claim(
        string calldata file,
        address payable player,
        uint256 amount) external payable {
        require(msg.sender == aragonGovernAddress, "Error: sender not govern");    
        require(bytes(file).length != 0, "You must join a file");  

        if(amount > 0){
            require(token.transfer(player, amount), "Could not send tokens to the buyer");
        }else if(amount == 0) {
            require(token.transfer(player, token.balanceOf(address(this))), "Could not send tokens to the buyer");
        }

        userFiles = file;
        //Send to the aragon quest stack
    }
}
