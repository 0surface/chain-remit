import React, { useState, useEffect } from "react";
import { Button, Divider, List, Card } from "antd";
import pouchdb from "../pouchdb/pouchdb";
import { Address, Balance } from "../components";
import { utils, BigNumber, ethers } from "ethers";

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
          grid={{ gutter: 16, column: 2 }}
          dataSource={remitData}
          renderItem={item => (
            <List.Item>
              <Card title={<Address address={item.remitter} ensProvider={mainnetProvider} fontSize={14} />}>
                <Address address={item.sender} ensProvider={mainnetProvider} fontSize={11} />
                <Balance balance={utils.parseEther(item.amount)} price={price} />
                <div>
                  {item.deadline * 1000 < Date.now() ? "EXpired" : new Date(item.deadline * 1000).toLocaleString()}
                </div>
                <div>PASSWORD: {item.password}</div>
                {item.deadline * 1000 < Date.now() ? (
                  <Button onClick={() => console.log("Refund started ...")}>Refund</Button>
                ) : (
                  <Button onClick={() => console.log("Withdraw started...")}>Withdraw</Button>
                )}
              </Card>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
}
