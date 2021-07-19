import React, { useState, useEffect } from "react";
import { RightCircleOutlined, LeftCircleOutlined } from "@ant-design/icons";
import { Address, Balance } from "../components";
import { utils, BigNumber, ethers } from "ethers";
import RemitDeadline from "./RemitDeadline";
import { parseEther } from "@ethersproject/units";
import pouchdb from "../pouchdb/pouchdb";
import Withdraw from "./RemitWithdraw";
import Refund from "./RemitRefund";
import PasswordInput from "./PasswordInput";

export default function RemitItem({
  address,
  userSigner,
  localProvider,
  mainnetProvider,
  price,
  tx,
  writeContracts,
  readContracts,
  remitId,
  remitter,
  amount,
  deadline,
  password,
  remitKey,
  remitHasSettled,
}) {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const hasExpired = timestamp => {
    return timestamp * 1000 < Date.now();
  };

  return (
    <div style={{ display: "inline-block", width: "100%", justifyContent: "left" }}>
      <Address address={remitter} ensProvider={mainnetProvider} fontSize={18} />
      <Balance balance={utils.parseEther(amount)} price={price} />
      <RemitDeadline deadlineTimestamp={deadline} remitHasSettled={remitHasSettled} />

      {showWithdraw && (
        <Withdraw
          localProvider={localProvider}
          userSigner={userSigner}
          address={address}
          password={password}
          tx={tx}
          writeContracts={writeContracts}
          readContracts={readContracts}
          id={deadline}
          remitId={remitId}
          remitKey={remitKey}
        />
      )}
      {showRefund && <Refund />}
      {!remitHasSettled && (
        <a
          onClick={() => {
            console.log("item::", deadline);
            hasExpired(deadline) ? setShowRefund(!showRefund) : setShowWithdraw(!showWithdraw);
            setExpanded(!expanded);
          }}
        >
          &nbsp; {expanded ? <LeftCircleOutlined /> : <RightCircleOutlined />}
        </a>
      )}
    </div>
  );
}
