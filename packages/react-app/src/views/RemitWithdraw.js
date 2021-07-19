import React, { useState, useEffect } from "react";
import { Button, Input } from "antd";
import { utils, BigNumber, ethers } from "ethers";
import pouchdb from "../pouchdb/pouchdb";

const initWithdraw = {
  remitId: "",
  password: "",
  amount: 0,
};
export default function Withdraw({
  address,
  userSigner,
  localProvider,
  password,
  tx,
  writeContracts,
  readContracts,
  id,
  remitKey,
  remitId,
}) {
  const [withdraw, setWithdraw] = useState(initWithdraw);
  const [inputId, setInputId] = useState(id);

  useEffect(() => {
    setInputId(id);
  }, [id]);

  const _withdraw = async (password, remitKey) => {
    if (password) {
      console.log("Withdraw started...");
      console.log("writeContracts", writeContracts);
      console.log("readContracts", readContracts);
      console.log("userSigner", userSigner);
      console.log("address", address);
      console.log("password", password);
      console.log("remitId", remitId);

      const bytes32Password = utils.formatBytes32String(password);
      console.log("bytes32Password", bytes32Password);

      const _remitKey = await readContracts.Remittance.generateKey(address, bytes32Password);
      console.log("_remitKey", _remitKey);
      const ledgerValue = await readContracts.Remittance.ledger(_remitKey);
      console.log("ledgerValue", ledgerValue);
      console.log("ledgerValue", Number(ledgerValue[0]));
      try {
        const staticCallTx = await writeContracts.Remittance.callStatic.withdraw(bytes32Password);
        console.log("staticCallTx", staticCallTx);
      } catch (staticCallTxError) {
        console.error("staticCallTx:Error::", staticCallTxError);
        return;
      }

      try {
        const withdrawTxObj = await tx(writeContracts.Remittance.withdraw(bytes32Password));
        const withdrawTxRecepit = await withdrawTxObj.wait();
        console.log("withdrawTxObj", withdrawTxObj);
        console.log("withdrawTxRecepit", withdrawTxRecepit);

        // event
        const withdrawEvent = withdrawTxRecepit.events[0];
        const args = withdrawEvent.args;
        console.log("key", args.key);
        console.log("withdrawer", args.withdrawer);
        console.log("withdrawn", Number(args.withdrawn));
        console.log("receiverPassword", utils.parseBytes32String(args.receiverPassword));

        // database update
        console.log("remitId", remitId);
        const updateResult = await pouchdb.update(remitId, "remitHasSettled", true);
        console.log("updateResult", updateResult);
      } catch (error) {
        console.log("withdrawTx:Error::", error);
        error.data && error.data !== undefined && console.log("withdraw::Error", error.data.message);
      }
    }
  };

  function handleSubmit(e) {
    console.log("withdraw.password::", withdraw.password);
    console.log("withdraw.amount::", withdraw.amount);
    _withdraw(password, remitKey);
  }

  function handleChange(e) {
    e.persist();
    setWithdraw(currWithdraw => {
      return {
        ...currWithdraw,
        [e.target.id]: e.target.value,
        [`${e.target.id}Error`]: "",
      };
    });
  }
  return (
    <>
      <Input.Password
        id={inputId}
        name={id}
        type="password"
        placeholder="password"
        style={{ width: "auto" }}
        onChange={handleChange}
      />
      <Button onClick={handleSubmit}>Withdraw</Button>
    </>
  );
}
