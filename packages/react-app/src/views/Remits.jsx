import React, { useState, useEffect } from "react";
import { Button, Divider, List, Card } from "antd";
import pouchdb from "../pouchdb/pouchdb";
import { Address, Balance } from "../components";
import { utils, BigNumber, ethers } from "ethers";
import RemitDeadline from "./RemitDeadline";

export default function Remits({ address, mainnetProvider, localProvider, yourLocalBalance, price }) {
  pouchdb.init();
  const _senderAddress = address;
  console.log("_senderAddress", address);

  const [remitData, setRemitData] = useState();
  //useEffect(() => {}, [setRemitData]);

  async function getRemits() {
    const db = await pouchdb.fetchBySender(address);
    setRemitData(db);
  }

  async function handleList() {
    getRemits();
  }

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 800, margin: "auto", marginTop: 64 }}>
        <Button onClick={handleList}>Get Remits</Button>
        <Divider />
        <h3>TOTAL:{remitData === undefined ? "0" : remitData.length}</h3>
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={remitData}
          renderItem={item => (
            <List.Item>
              <div style={{ display: "inline-block", width: "100%", justifyContent: "center" }}>
                <Address address={item.sender} ensProvider={mainnetProvider} fontSize={11} />
                <Balance balance={utils.parseEther(item.amount)} price={price} />
                <RemitDeadline deadlineTimestamp={item.deadline} locale={"en-US"} />
                {/* <div>PASSWORD: {item.password}</div> */}
                {item.deadline * 1000 < Date.now() ? (
                  <Button onClick={() => console.log("Refund started ...")}>Refund</Button>
                ) : (
                  <Button onClick={() => console.log("Withdraw started...")}>Withdraw</Button>
                )}
              </div>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
}
