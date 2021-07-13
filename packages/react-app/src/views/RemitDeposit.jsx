import React, { useState } from "react";
import { AddressInput, Address, Balance, EtherInput } from "../components";
import { utils, BigNumber, ethers } from "ethers";
import { formatEther, parseEther } from "@ethersproject/units";
import { Button, Card, DatePicker, Divider, Input, Spin } from "antd";
import pouchdb from "../pouchdb/pouchdb";

const emptyDeposit = {
  senderError: "",
  remitterError: "",
  passwordError: "",
  lockDurationError: "",
  amountError: "",
  sender: "",
  remitter: "",
  remitKey: "",
  password: "",
  lockDuration: 0,
  amount: 0,
};

function toBytes(input) {
  return utils.formatBytes32String(input);
}

export default function Deposit({
  address,
  userSigner,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  writeContracts,
  readContracts,
  depositRemit,
  depositData,
}) {
  const [deposit, setDeposit] = useState(emptyDeposit);

  function handleChange(e, value, id) {
    if (e.target !== undefined) {
      console.log("1sst block::value:", value);
      console.log("e.target.id", e.target.id);
      console.log("e.target.value", e.target.value);
      setDeposit(currDeposit => {
        console.log("::currDeposit obj::", currDeposit);
        return {
          ...currDeposit,
          [e.target.id]: e.target.value,
          [`${e.target.id}Error`]: "",
        };
      });
    } else {
      console.log("e", e);
      console.log("value:", value);
      console.log("id:", id);
      console.log("`${id}Error`", `${id}Error`);
      console.log("::deposit obj::", deposit);
      setDeposit(currDeposit => {
        console.log("::currDeposit obj::", currDeposit);
        return {
          ...currDeposit,
          [id]: e,
          [`${id}Error`]: "",
        };
      });
    }

    if (deposit.password) {
      _generateRemitKey();
    }
  }

  function handleSubmitValidation(e) {
    if (deposit.sender === "") {
      deposit.senderError = "Sender address can not be empty";
    } else if (deposit.sender.length < 5) {
      deposit.senderError = "Sender address is too short";
    }
    //-----------------
    if (deposit.remitter === "") {
      deposit.remitterError = "Remitter address can not be empty";
    } else if (deposit.remitter.length < 5) {
      deposit.remitterError = "Remitter address is too short";
    }
    //-----------------
    if (deposit.password === "") {
      deposit.passwordError = "Password can not be empty";
    } else if (deposit.password.length < 6) {
      deposit.passwordError = "Password must be at least 6 characters";
    }
    //-----------------
    if (deposit.lockDuration > 3153600000) {
      deposit.lockDurationError = "Lock duration can not be longer than 100 years";
    }
    //-----------------
    if (deposit.amount < 1) {
      deposit.amountError = "Minimum deposit amount of 2 wei required";
    }
  }

  function handleSubmitErrors(e) {
    setDeposit(currDeposit => {
      return {
        ...currDeposit,
        [`${e.target.id}Error`]: e.target.value,
      };
    });
  }

  function handleSubmit(e) {
    //e.preventDefault();
    handleSubmitValidation(e);
    handleSubmitErrors(e);
  }

  const depositFunds = async (remitKey, lockDuration, amount) => {
    tx(
      await writeContracts.Remittance.deposit(deposit.remitKey, lockDuration, {
        value: parseEther(amount),
      }),
    );
  };

  const _generateRemitKey = async () => {
    if (deposit && deposit.remitter && deposit.password) {
      const _remitKey = await readContracts.Remittance.generateKey(
        deposit.remitter,
        utils.formatBytes32String(deposit.password),
      );
      console.log("_remitKey", _remitKey);
      deposit.remitKey = _remitKey;
    }
  };

  async function handleDepositClick() {
    console.log("::inside handleDepositClick::================================================================");
    console.log("userSigner", userSigner);
    console.log("deposit::", deposit);
    // console.log("deposit.remitter, deposit.password::", deposit.remitter, deposit.password);
    // console.log("deposit.amount::", deposit.amount);
    // console.log("deposit.lockDuration::", deposit.lockDuration);

    // console.log("parseEther(deposit.amount)::", parseEther(deposit.amount));
    // console.log("Number(parseEther(deposit.amount))::", Number(parseEther(deposit.amount)));

    const _remitKey = await _generateRemitKey();

    //depositFunds(_remitKey, deposit.lockDuration, deposit.amount);

    // const { senderError, remitterError, passwordError, lockDurationError, amountError, ...data } = deposit;
    // depositData({
    //   data,
    // });

    // tx(
    //   await writeContracts.Remittance.deposit(deposit.remitKey, deposit.lockDuration, {
    //     value: parseEther(deposit.amount.toString()),
    //   }),
    // );

    const depositTxObj = await writeContracts.Remittance.deposit(deposit.remitKey, deposit.lockDuration, {
      value: parseEther(deposit.amount),
    });
    const depositTxRecepit = await depositTxObj.wait();
    console.log("depositTxObj", depositTxObj);
    console.log("depositTxRecepit", depositTxRecepit);

    //TODO : save successful tx data to persistant storage
    const withdrawalDeadline = Number(depositTxRecepit.events[0].args[3]);
    console.log("txBlock", withdrawalDeadline);

    const txId = depositTxObj.hash.toString();
    console.log("txId", txId);

    pouchdb.init();
    const remitRecord = pouchdb.setRemit(
      txId,
      userSigner.address.toString(),
      deposit.remitter,
      deposit.password,
      deposit.lockDuration,
      deposit.amount,
      _remitKey,
      withdrawalDeadline,
    );
    const saveResult = await pouchdb.save(remitRecord);
    console.log("saveResult", saveResult);

    const getresult = await pouchdb.get(saveResult.id);
    console.log("getresult", getresult);

    const fetchAll = await pouchdb.fetchAll();
    console.log("fetchAll", fetchAll);

    const fetchBySender = await pouchdb.fetchBySender(userSigner.address);
    console.log("fetchBySender", fetchBySender);

    const fetchByRemiiter = await pouchdb.fetchByRemiiter(deposit.remitter);
    console.log("fetchByRemiiter", fetchByRemiiter);

    console.log("::inside handleDepositClick::================================================================");
  }

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 550, margin: "auto", marginTop: 64 }}>
        <Divider />
        Your Address:
        <Address address={address} ensProvider={mainnetProvider} fontSize={16} />
        <Divider />
        {/* use utils.formatEther to display a BigNumber: */}
        <h2>Your Balance: {yourLocalBalance ? utils.formatEther(yourLocalBalance) : "..."}</h2>
        <div>OR</div>
        <Balance address={address} provider={localProvider} price={price} />
        <Divider />
        <Divider />
        <h6>Remit Key</h6>
        <Input id="remitKey" name="remitKey" disabled value={deposit.remitKey} />
        <Divider />
        <label>Sender</label>
        <AddressInput
          id="sender"
          name="sender"
          autoFocus
          disabled
          value={address}
          ensProvider={mainnetProvider}
          placeholder="Enter Depositor"
          // onChange={(e, value) => {
          //   handleChange(e, value, "sender");
          // }}
        />
        <label>Remitter</label>
        <AddressInput
          id="remitter"
          name="remitter"
          autoFocus
          ensProvider={mainnetProvider}
          placeholder="Enter Remitter"
          onChange={(e, value) => {
            handleChange(e, value, "remitter");
          }}
        />
        <label>Password</label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="password"
          onChange={(e, value) => {
            handleChange(e, value, "password");
          }}
          onBlur={e => {
            console.log("onblur", e.target.value);
            _generateRemitKey();
          }}
        />
        <br />
        <label>Lock Duration Seconds</label>
        <Input
          id="lockDuration"
          name="lockDuration"
          type="number"
          min={0}
          max={3153600000}
          placeholder="Enter Duration in seconds (< 3153600000 )"
          //onChange={handleChange_}
          onChange={(e, value) => {
            handleChange(e, value, "lockDuration");
          }}
        />
        <br />
        <label>Amount</label>
        <EtherInput
          autofocus
          price={price}
          placeholder="Enter amount"
          onChange={(e, value) => {
            handleChange(e, value, "amount");
          }}
        />
        <br />
        <Button onClick={handleDepositClick}>Deposit</Button>
      </div>
    </div>
  );
}
