import React, { useState, useEffect } from "react";
import { Button, Divider, List, Card } from "antd";
import { RightCircleOutlined } from "@ant-design/icons";
import pouchdb from "../pouchdb/pouchdb";
import { Address, Balance } from "../components";
import { utils, BigNumber, ethers } from "ethers";
import RemitDeadline from "./RemitDeadline";
import Withdraw from "./RemitWithdraw";
import Refund from "./RemitRefund";
import RemitItem from "./RemitItem";

export default function Remits({
  address,
  userSigner,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  writeContracts,
  readContracts,
}) {
  pouchdb.init();

  const [remitData, setRemitData] = useState([]);
  const [currentTimestamp, setCurrentTimestamp] = useState(Date.now());
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showRefund, setShowRefund] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const db = await pouchdb.fetchByRemiiter(address);
      console.log(db);
      setRemitData(db);
    }
    fetchData();
  }, [address]);

  const _withdraw = async password => {
    if (password) {
      console.log("Withdraw started...");
      try {
        tx(writeContracts.Remittance.withdraw(utils.formatBytes32String(password)));
        const withdrawTxObj = await writeContracts.Remittance.withdraw(utils.formatBytes32String(password));
        const withdrawTxRecepit = await withdrawTxObj.wait();
        console.log("withdrawTxObj", withdrawTxObj);
        console.log("withdrawTxRecepit", withdrawTxRecepit);
      } catch (error) {
        console.log("withdraw::", error);
      }
    }
  };
  // const currentTimestamp = await localProvider.getBlock("latest");

  const goButton = async isWithdraw => {
    setCurrentTimestamp(42);
  };

  const hasExpired = timestamp => {
    const v = timestamp * 1000 < Date.now();
    console.log("v", v);
    return v;
  };

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 800, margin: "auto", marginTop: 64 }}>
        <h3>TOTAL:{remitData === undefined ? "0" : remitData.length}</h3>
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={remitData}
          renderItem={item => (
            <List.Item>
              <RemitItem
                address={address}
                userSigner={userSigner}
                localProvider={localProvider}
                mainnetProvider={mainnetProvider}
                price={price}
                tx={tx}
                writeContracts={writeContracts}
                readContracts={readContracts}
                remitter={item.remitter}
                amount={item.amount}
                deadline={item.deadline}
                password={item.password}
                remitKey={item.remitKey}
              />
            </List.Item>
          )}
        />
      </div>
    </div>
  );
}
