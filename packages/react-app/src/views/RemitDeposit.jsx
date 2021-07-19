import React, { useState } from "react";
import { AddressInput, EtherInput } from "../components";
import { utils, ethers } from "ethers";
import { parseEther } from "@ethersproject/units";
import { Button, Divider, Input, Spin } from "antd";
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
  logDepositedEvent,
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
    if (deposit.lockDuration < 1) {
      deposit.lockDurationError = "Lock duration can not be empty";
    }
    //-----------------
    if (deposit.amount < parseEther((2 * 10) ^ -18)) {
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
    e.preventDefault();

    //handleSubmitValidation(e);
    //handleSubmitErrors(e);
    console.log("deposit obj::", deposit);
    handleDepositClick();
  }

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
    let _remitKey;
    if (!deposit.remitKey) {
      console.log("regenerate remit key");
      _remitKey = _generateRemitKey();
    }

    try {
      const depositCallStatic = await writeContracts.Remittance.callStatic.deposit(
        deposit.remitKey,
        deposit.lockDuration,
        {
          value: parseEther(deposit.amount),
        },
      );

      console.log("depositCallStatic:callTx", depositCallStatic);
    } catch (err) {
      console.log("depositCallStatic:callTx:error", err);
      return;
    }
    try {
      const depositTxObj = await tx(
        writeContracts.Remittance.deposit(deposit.remitKey, deposit.lockDuration, {
          value: parseEther(deposit.amount),
        }),
      );
      //console.log("logDepositedEvent", logDepositedEvent);

      const depositTxRecepit = await depositTxObj.wait();

      pouchdb.init();
      const saveResult = await pouchdb.save(
        pouchdb.setRemit(
          depositTxRecepit.transactionHash,
          userSigner.address,
          deposit.remitter,
          deposit.password,
          deposit.lockDuration,
          deposit.amount,
          _remitKey,
          Number(depositTxRecepit.events[0].args[3]),
        ),
      );
      console.log("saveResult", saveResult);
    } catch (depositTxError) {
      console.log("depositTxError:error", depositTxError);
    }

    console.log("::inside handleDepositClick::================================================================");
  }

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 550, margin: "auto", marginTop: 64 }}>
        <h5>Remit Key</h5>
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
          onChange={(e, value) => {
            handleChange(e, value, "sender");
          }}
        />
        <label>SEND TO </label>
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
        <span id="remitterError" name="remitterError" style={{ color: "red" }} value={deposit.remitterError}>
          {deposit.remitterError}
        </span>
        <br />
        <label>Password</label>
        <Input.Password
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
        <span id="passwordError" name="passwordError" style={{ color: "red" }} value={deposit.passwordError}>
          {deposit.passwordError}
        </span>
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
        <span
          id="lockDurationError"
          name="lockDurationError"
          style={{ color: "red" }}
          value={deposit.lockDurationError}
        >
          {deposit.remitterError}
        </span>

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
        <span id="amountError" name="amountError" style={{ color: "red" }} value={deposit.amountError}>
          {deposit.remitterError}
        </span>
        <br />
        <Button onClick={handleSubmit}>Deposit</Button>
      </div>
    </div>
  );
}
