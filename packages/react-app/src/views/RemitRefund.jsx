import React, { useState } from "react";
import { Button, Input, Alert } from "antd";
import { utils } from "ethers";
import pouchdb from "../pouchdb/pouchdb";
import moment from "moment";

export default function Refund({
  localProvider,
  tx,
  readContracts,
  writeContracts,
  remitKey,
  remitId,
  amount,
  remitHasSettled,
  onChange,
}) {
  const [refunded, setRefunded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const validate = async () => {
    //validate remit key
    if (remitKey === undefined || remitKey === null || remitKey === "") {
      setErrorMessage("Invalid remit key");
      return false;
    }

    //validate ledger value
    const ledgerValue = await readContracts.Remittance.ledger(remitKey);
    if (utils.formatEther(Number(ledgerValue[0])) !== amount) {
      setErrorMessage("Ledger value is not valid");
      return false;
    }

    return true;
  };

  const staticCall = async () => {
    //TODO:use env var here
    //make static call(when not in dev chain)
    const isHardhatDevChain = localProvider.connection.url.includes("localhost:8545");
    if (!isHardhatDevChain) {
      try {
        await tx(writeContracts.Remittance.callStatic.refund(remitKey));
      } catch (_staticCallError) {
        let exceptionMessage = _staticCallError?.data["message"]?.split("'")[1]?.split("refund:")[1];
        setErrorMessage(exceptionMessage);
        return false;
      }
    }
    return true;
  };

  const _refund = async remitId => {
    const isValid = await validate();
    if (!isValid) return;

    const callSuccess = await staticCall();
    if (!callSuccess) return;

    try {
      /* tx call */
      const refundTxObj = await tx(writeContracts.Remittance.refund(remitKey));
      const refundTxReceipt = await refundTxObj.wait();

      //database update
      const refundTimestamp = await localProvider.getBlock(refundTxReceipt.blockNumber).timestamp;
      const updateResult = await updateSettledRemit(refundTimestamp);
      if (updateResult) {
        setRefunded(true);
        console.log("refund success");
        onChange(true);
      }
    } catch (_refundError) {
      console.log("_refund", _refundError);
      return false;
    }
  };

  function handleSubmit(e) {
    //if success,
    const success = _refund(remitId);
    if (success) {
      console.log("refund success");
      onChange(true);
    } else {
      console.log("refund failed");
      onChange(false);
    }
    // update component state
    //else show failure notification

    // disable refund button
  }

  const updateSettledRemit = async refundTimestamp => {
    const updateResult1 = await pouchdb.update(remitId, "remitHasSettled", true);
    const updateResult2 = await pouchdb.update(remitId, "settledTimestamp", refundTimestamp);
    return updateResult1.ok && updateResult2.ok;
  };

  function onBlur(e) {
    //validate input
    //enable refund button
  }

  function handleChange(e) {
    //validate input
    //enable refund button
  }

  // function handleChange(e) {
  //   e.persist();
  //   setRefund(currRefund => {
  //     return {
  //       ...currRefund,
  //       [e.target.id]: e.target.value,
  //       [`${e.target.id}Error`]: "",
  //     };
  //   });
  // }
  return refunded ? (
    ""
  ) : (
    <>
      {/* <Input.Password
        id="password"
        name="password"
        type="password"
        placeholder="password"
        style={{ width: "auto" }}
        onChange={handleChange}
      /> */}

      <Button onClick={handleSubmit}>Refund</Button>
      {errorMessage && (
        <Alert style={{ width: "auto" }} message="Error" description={errorMessage} type="error" showIcon closable />
      )}
    </>
  );
}
