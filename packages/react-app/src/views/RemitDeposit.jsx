import React, { useState } from "react";
import { AddressInput, Address, Balance, EtherInput } from "../components";
import { utils, BigNumber } from "ethers";
import "bootstrap/dist/css/bootstrap.css";
import { Button, Card, DatePicker, Divider, Input, Spin } from "antd";

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

  async function handleDepositClick() {
    console.log("::inside handleDepositClick::================================================================");
    console.log("deposit.remitter, deposit.password::", deposit.remitter, deposit.password);

    const _remitKey = await readContracts.Remittance.generateKey(
      deposit.remitter,
      utils.formatBytes32String(deposit.password),
    );
    console.log("_remitKey", _remitKey);
    deposit.remitKey = _remitKey;

    const { senderError, remitterError, passwordError, lockDurationError, amountError, ...data } = deposit;
    depositData({
      data,
    });

    const depositTxObj = await writeContracts.Remittance.deposit(deposit.remitKey, deposit.lockDuration, {
      value: BigNumber.from(deposit.amount * 1000000000000000000),
    });
    const depositTxRecepit = await depositTxObj.wait();

    console.log("depositTxObj", depositTxObj);
    console.log("depositTxRecepit", depositTxRecepit);
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
        <label for="depositor">Sender</label>
        <AddressInput
          id="sender"
          name="sender"
          autoFocus
          ensProvider={mainnetProvider}
          placeholder="Enter Depositor"
          onChange={(e, value) => {
            handleChange(e, value, "sender");
          }}
        />
        <label for="remitter">Remitter</label>
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
        <label for="password">Password</label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="password"
          onChange={(e, value) => {
            handleChange(e, value, "password");
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
