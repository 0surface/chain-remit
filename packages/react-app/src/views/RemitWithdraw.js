import React, { useState, useEffect } from "react";
import { Button, Input } from "antd";
import { utils, BigNumber, ethers } from "ethers";

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
      console.log("userSigner", userSigner);
      console.log("address", address);
      console.log("password", password);
      console.log("utils.formatBytes32String(password)", utils.formatBytes32String(password));

      try {
        const _remitKey = await readContracts.Remittance.generateKey(address, utils.formatBytes32String(password));
        console.log("_remitKey", _remitKey);
        const ledgerValue = await readContracts.Remittance.ledger(_remitKey);
        console.log("ledgerValue", ledgerValue);
        console.log("ledgerValue", Number(ledgerValue[0]));

        const callTx = await localProvider.call(writeContracts.Remittance.withdraw(_remitKey));
        console.log("callTx", callTx);

        // const withdrawTxObj = await tx(writeContracts.Remittance.withdraw(utils.formatBytes32String(password)));
        // const withdrawTxRecepit = await withdrawTxObj.wait();
        // console.log("withdrawTxObj", withdrawTxObj);
        // console.log("withdrawTxRecepit", withdrawTxRecepit);
      } catch (error) {
        console.log("withdraw::", error);
        error.data.message !== undefined && console.log("withdraw::Error", error.data.message);
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
