import React, { useState } from "react";
import { utils } from "ethers";
import moment from "moment";
import { Modal, Button, Row, Col } from "antd";
import { Address, Balance } from "../components";
import RemitDeadline from "./RemitDeadline";
import Withdraw from "./RemitWithdraw";
import Refund from "./RemitRefund";

export default function RemitDetail({
  address,
  userSigner,
  mainnetProvider,
  localProvider,
  price,
  tx,
  writeContracts,
  readContracts,
  record,
}) {
  const addressIsSender = record.sender.toString() === address;
  const addressIsRemitter = record.remitter.toString() === address;
  const remitHasExpired = record.deadline < moment().unix();
  const [visible, setVisible] = useState(false);

  const showModal = () => {
    setVisible(true);
  };

  const handleOk = e => {
    console.log(e);
    setVisible(false);
  };

  const handleCancel = e => {
    console.log(e);
    setVisible(false);
  };
  const showRefund = !record.remitHasSettled && addressIsSender && remitHasExpired;
  const showWithdraw = !record.remitHasSettled && !addressIsSender && !remitHasExpired;
  const showRemitPending = !record.remitHasSettled && addressIsSender && !remitHasExpired;
  const showWithdrawExpired = !record.remitHasSettled && !addressIsSender && remitHasExpired;

  return (
    <>
      <Row>
        <Col span={12}>
          From :{" "}
          {addressIsSender ? "You" : <Address address={record.sender} ensProvider={mainnetProvider} fontSize={16} />}
          <br />
          To:{" "}
          {addressIsRemitter ? (
            "You"
          ) : (
            <Address address={record.remitter} ensProvider={mainnetProvider} fontSize={12} />
          )}
          <br />
          Deadline : <RemitDeadline deadlineTimestamp={record.deadline} remitHasSettled={record.remitHasSettled} />
          <br />
          Lock Duration:
          <br />
          From:[{moment.unix(record.deadline - record.lockDuration).format("MMMM Do YYYY, h:mm:ss a")}]
          <br />
          To : [{moment.unix(record.deadline).format("MMMM Do YYYY, h:mm:ss a")}]
          <br />
          Show Plain Password: <b>{record.password}</b>
          <br />
        </Col>
        <Col span={12}>
          {/* remitHasSettled ?
                    true = show settled message
                    false = go to next
                addressIsSender ?
                    true =   remitHasExpired ?
                        true = Refund Modal
                        false = awaiting remitter /Remit pending message
                    false = remitHasExpired ?
                        true = Expired message
                        false = Withdraw Modal
            */}
          {record.remitHasSettled && <>Settled On : [some day]</>}
          {showRefund && (
            <Button type="primary" onClick={showModal}>
              Refund
            </Button>
          )}
          {showWithdraw && (
            <Button type="primary" onClick={showModal}>
              Withdraw
            </Button>
          )}
          {showRemitPending && <>Awaiting Remittance / Pending</>}
          {showWithdrawExpired && <>Expired </>}
          {/*           
          {record.remitHasSettled ? (
            <>Settled On : [some day]</>
          ) : addressIsSender ? (
            remitHasExpired ? (
              <>
                <Button type="primary" onClick={showModal}>
                  Refund
                </Button>
              </>
            ) : (
              <>Awaiting Remittance / Pending</>
            )
          ) : remitHasExpired ? (
            <>
              <>Awaiting Remittance / Pending</>
            </>
          ) : (
            <Button type="primary" onClick={showModal}>
              Withdraw
            </Button>
          )} */}
        </Col>
      </Row>
      <Modal
        title={`Remit${(<Balance balance={utils.parseEther(record.amount)} price={price} />)}`}
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        okButtonProps={{ disabled: true }}
        cancelButtonProps={{ disabled: true }}
      >
        <p>{record.remitHasSettled ? "remitHasSettled " : "remit is active"} </p>
        <p>{remitHasExpired ? "remitHasExpired " : "deadline not yet met"} </p>
        <p>{addressIsSender ? "addressIsSender " : "address Is Remitter"} </p>
        {showWithdraw && (
          <Withdraw
            localProvider={localProvider}
            userSigner={userSigner}
            address={address}
            password={record.password}
            tx={tx}
            writeContracts={writeContracts}
            readContracts={readContracts}
            id={record.deadline}
            remitId={record.remitId}
            remitKey={record.remitKey}
          />
        )}
        {showRefund && (
          <Refund
            localProvider={localProvider}
            tx={tx}
            readContracts={readContracts}
            writeContracts={writeContracts}
            remitId={record.remitId}
            remitKey={record.remitKey}
            amount={record.amount}
            remitHasSettled={record.remitHasSettled}
          />
        )}
      </Modal>
    </>
  );
}
