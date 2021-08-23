import React, { useState, useEffect } from "react";
import { RightCircleOutlined, LeftCircleOutlined } from "@ant-design/icons";
import { utils } from "ethers";

import RemitDeadline from "./RemitDeadline";
import { Address, Balance } from "../components";
import Withdraw from "./RemitWithdraw";
import Refund from "./RemitRefund";

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
  addressIsRemitter,
}) {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isRemitter, setIsRemitter] = useState(false);

  const [expired, setExpired] = useState(false);
  const [showArrow, setShowArrow] = useState(false);

  const hasExpired = timestamp => {
    return timestamp * 1000 < Date.now();
  };

  const handleSettlement = _remitHasSettled => {
    setShowArrow(!_remitHasSettled);
    setExpanded(!_remitHasSettled);
  };

  const arrowStatus = () => {
    const senderOk = !addressIsRemitter && expired && !remitHasSettled;
    const remitterOk = addressIsRemitter && !expired && !remitHasSettled;
    const show = senderOk || remitterOk;
    setShowArrow(show);
  };

  useEffect(() => {
    // console.log("remitter, address, addressIsRemitter", remitter, address, addressIsRemitter);
    setIsRemitter(addressIsRemitter);
    setExpired(hasExpired(deadline));
    arrowStatus();
  }, [remitHasSettled, address]);

  return (
    <div style={{ display: "inline-block", width: "100%", justifyContent: "left" }}>
      {addressIsRemitter ? <Address address={remitter} ensProvider={mainnetProvider} fontSize={18} /> : "Me"}
      <Balance balance={utils.parseEther(amount)} price={price} />
      <RemitDeadline deadlineTimestamp={deadline} remitHasSettled={remitHasSettled} />
      {remitHasSettled ? (
        <></>
      ) : !expired && isRemitter && showWithdraw ? (
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
      ) : expired && !addressIsRemitter && showRefund ? (
        <Refund
          localProvider={localProvider}
          tx={tx}
          readContracts={readContracts}
          writeContracts={writeContracts}
          remitKey={remitKey}
          remitId={remitId}
          amount={amount}
          remitHasSettled={remitHasSettled}
          onChange={handleSettlement}
        />
      ) : (
        ""
      )}
      {!remitHasSettled && ((isRemitter && !expired) || (!isRemitter && expired)) ? (
        <a
          onClick={() => {
            console.log("item::", deadline);
            !isRemitter && expired && setShowRefund(!showRefund);
            isRemitter && !expired && setShowWithdraw(!showWithdraw);
            setExpanded(!expanded);
          }}
        >
          &nbsp; {expanded ? <LeftCircleOutlined /> : <RightCircleOutlined />}
        </a>
      ) : (
        ""
      )}
    </div>
  );
}
