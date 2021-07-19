import React, { useState } from "react";
import { Button, Input } from "antd";
import { utils } from "ethers";
import pouchdb from "../pouchdb/pouchdb";
import moment from "moment";

const initRefund = {
  remitKey: "",
  remitId: "",
  hasRefunded: false,
};

export default function Refund({ address, tx, writeContracts, remitKey, remitId }) {
  const [refund, setRefund] = useState(initRefund);
  const [refunded, setRefunded] = useState(false);

  const _generateKey = async (address, password) => {
    const _remitKey = await writeContracts.Remittance.generateKey(address, utils.formatBytes32String(password));
    return _remitKey;
  };

  const _refund = async remitId => {
    /* static call */
    try {
      if (remitKey !== undefined) {
        const ledgerValue = await writeContracts.Remittance.ledger(remitKey);
        console.log("ledgerValue", ledgerValue);
        console.log("ledgerValue", Number(ledgerValue[0]));
        const staticCall = await writeContracts.Remittance.callStatic.refund(remitKey);
        console.log("staticCall", staticCall);
      }
    } catch (_staticCallError) {
      console.log("_staticCall", _staticCallError);
      return;
    }

    /* tx call */
    try {
      const refundTxObj = await tx(writeContracts.Remittance.refund(remitKey));
      const refundTxReceipt = await refundTxObj.wait();
      //event
      const refundEvent = refundTxReceipt.events[0];
      const args = refundEvent.args;
      //refundee, bytes32 indexed key, uint refunded
      console.log("refundee", args.refundee);
      console.log("key", args.key);
      console.log("refunded", Number(args.refunded));
      //database update
      const updateResult = await updateSettledRemit();
      if (updateResult) {
        setRefunded(true);
      }
    } catch (_refundError) {
      console.log("_refund", _refundError);
    }
  };

  function handleSubmit(e) {
    _refund(remitId);
  }

  const updateSettledRemit = async () => {
    console.log("remitId", remitId);
    const updateResult1 = await pouchdb.update(remitId, "remitHasSettled", true);
    const updateResult2 = await pouchdb.update(remitId, "settledTimestamp", moment().unix());
    // moment().unix()
    console.log("updateResult", updateResult1, updateResult2);
    return updateResult1 && updateResult2;
  };

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
  return (
    <>
      <Input.Password
        id="password"
        name="password"
        type="password"
        placeholder="password"
        style={{ width: "auto" }}
        // onChange={handleChange}
      />
      <Button onClick={handleSubmit}>Refund</Button>
    </>
  );
}
