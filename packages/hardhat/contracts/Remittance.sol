//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract Remittance is Pausable, Ownable {
    uint256 constant public MAX_DURATION = 4800 weeks; //3153600000; //100 years
    uint256 constant public MIN_DURATION = 0;
    bytes32 constant NULL_BYTES32 = bytes32(0); 

    struct Remit {        
        uint256 amount;
        uint256 deadline;
        address depositor;
    }

    mapping(bytes32 => Remit) public ledger;

    event LogDeposited(address indexed depositor, bytes32 indexed key, uint deposited, uint withdrawalDeadline);
    event LogWithdrawal(address indexed withdrawer, bytes32 indexed key, uint withdrawn, bytes32 receiverPassword);    
    event LogRefund(address indexed refundee, bytes32 indexed key, uint refunded);

    /*
    @dev generates keccak256 hash from params
    @param non null address
    @param non-empty string value
     */
    function generateKey(address remitterAddresss, bytes32 receiverPassword)
        view public
        whenNotPaused
        returns (bytes32 remitKey)
    {
        require(remitterAddresss != address(0), "Remittance::generateKey:Remitter address cannot be null");
        require(receiverPassword != NULL_BYTES32, "Remittance::generateKey:Remitter password can not be empty");
        return keccak256(abi.encodePacked(receiverPassword, remitterAddresss, this));
    }

    /*
    @dev transfer value to contract
    @params string remittance contracted generated key
    @params uint256 time lock duration in seconds
     */
    function deposit(bytes32 remitKey, uint256 depositLockDuration)
        public 
        whenNotPaused payable
    {
        require(msg.value > 0, "Remittance::deposit:Invalid minimum deposit amount");
        require(remitKey != NULL_BYTES32, "Remittance::deposit:Invalid remitKey value");
        require(depositLockDuration > MIN_DURATION, "Remittance::deposit:Invalid minumum lock duration");
        require(depositLockDuration < MAX_DURATION, "Remittance::deposit:Invalid maximum lock duration");

         //SLOAD        
        require(ledger[remitKey].amount == 0, "Remittance::deposit:Invalid, remit Key has an active deposit");
        require(ledger[remitKey].depositor == address(0), "Remittance::deposit:Invalid, Password has previously been used");

        uint256 withdrawalDeadline = block.timestamp + depositLockDuration;

        //SSTORE
        ledger[remitKey] = Remit({ 
            depositor: _msgSender(), 
            amount: msg.value, 
            deadline: withdrawalDeadline
        });
        emit LogDeposited(_msgSender(), remitKey, msg.value, withdrawalDeadline);
    }

     /*
    @dev transfer value to caller
    @params string password 
     */
    function withdraw(bytes32 receiverPassword) 
        whenNotPaused
        external 
    { 
        bytes32 _ledgerKey = generateKey(msg.sender, receiverPassword);

        //SLOAD
        Remit memory entry = ledger[_ledgerKey];

        require(entry.amount != 0, "Remittance::withdraw:Caller is not owed a withdrawal");
        require(block.timestamp <= entry.deadline, "Remittance::withdraw:withdrawal period has expired");

        //SSTORE
        ledger[_ledgerKey].amount = 0;
        ledger[_ledgerKey].deadline = 0;
        
        emit LogWithdrawal(msg.sender,_ledgerKey, entry.amount, receiverPassword);
        (bool success, ) = (msg.sender).call{value: entry.amount}("");        
        require(success, "withdraw failed");        
    }

    /*
    @dev refund value to sender
    @params bytes32 remit key
     */
    function refund(bytes32 remitKey)
        whenNotPaused
        external 
    { 
        //SLOAD
        Remit memory entry = ledger[remitKey];
        
        require(entry.depositor == msg.sender, "Remittance::refund:Caller is not depositor");
        require(entry.amount != 0, "Remittance::refund:Caller is not owed a refund");
        require(block.timestamp > entry.deadline, "Remittance::refund:Deposit is not yet eligible for refund");

        //SSTORE
        ledger[remitKey].amount = 0;
        ledger[remitKey].deadline = 0;
        
        emit LogRefund(msg.sender, remitKey, entry.amount);
        (bool success, ) = (msg.sender).call{value: entry.amount}("");        
        require(success, "refund failed");
    }
}