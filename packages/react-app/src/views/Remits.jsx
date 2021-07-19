import React, { useState, useEffect } from "react";
import { List } from "antd";
import pouchdb from "../pouchdb/pouchdb";
import RemitItem from "./RemitItem";
import moment from "moment";

export default function Remits({
  address,
  userSigner,
  mainnetProvider,
  localProvider,
  price,
  tx,
  writeContracts,
  readContracts,
}) {
  pouchdb.init();
  const [remitData, setRemitData] = useState([]);
  const [sentRemits, setSentRemits] = useState([]);
  const [refundRemits, setRefundRemits] = useState([]);
  const [withdrawRemits, setWithdrawRemits] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const db = await pouchdb.fetchByAddress(address);

      console.log("db", db);
      setRemitData(db);
    }
    fetchData();
  }, [address]);

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
                remitId={item._id}
                remitter={item.remitter}
                amount={item.amount}
                deadline={item.deadline}
                password={item.password}
                remitKey={item.remitKey}
                remitHasSettled={item.remitHasSettled}
                addressIsRemitter={address.toString() === item.remitter.toString()}
              />
            </List.Item>
          )}
        />
      </div>
    </div>
  );
}
