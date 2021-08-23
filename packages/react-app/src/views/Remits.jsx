import React, { useState, useEffect } from "react";
//import moment from "moment";
import { List, Switch } from "antd";
import pouchdb from "../pouchdb/pouchdb";
//import RemitItem from "./RemitItem";

import RemitsForMeCard from "./RemitsForMeCard";

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
  const [sentByAddressRemits, setSentByAddressRemits] = useState([]);
  const [sentForAddressRemits, setsentForAddressRemits] = useState([]);
  const [totalRemits, setTotalRemits] = useState(0);

  const [switchCheckedState, setSwitchCheckedState] = useState({
    checkedBy: false,
    checkedFor: true,
  });

  const handleListSwitchChange = event => {
    setSwitchCheckedState({ ...switchCheckedState, [event.target.name]: event.target.checked });
  };

  useEffect(() => {
    async function fetchData() {
      const db = await pouchdb.fetchByAddress(address);
      console.log("db.count", db.length);
      setTotalRemits(db.length);

      const _sentByAddressData = db.filter(x => x.sender === address.toString());
      console.log("_sentByAddressData", _sentByAddressData);
      setSentByAddressRemits(_sentByAddressData);

      const _sentForAddressData = db.filter(x => x.remitter === address.toString());
      console.log("_sentForAddressData", _sentForAddressData);
      setsentForAddressRemits(_sentForAddressData);
    }
    fetchData();
  }, [address]);

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 800, margin: "auto", marginTop: 64 }}>
        <h3>TOTAL:{totalRemits}</h3>
        <>
          <Switch
            checked={switchCheckedState.checkedBy}
            onChange={handleListSwitchChange}
            name="checkedBy"
            checkedChildren="By Me"
            unCheckedChildren="By Me"
            defaultChecked
          />
          <Switch
            checked={switchCheckedState.checkedFor}
            onChange={handleListSwitchChange}
            name="checkedFor"
            checkedChildren="For Me"
            unCheckedChildren="For Me"
            defaultChecked
          />
        </>
        {switchCheckedState.checkedBy && (
          <List
            // grid={{ gutter: 16, column: 1 }}
            dataSource={sentByAddressRemits}
            renderItem={item => (
              <List.Item>
                <RemitsForMeCard
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
        )}
        <hr />
        {switchCheckedState.checkedFor && (
          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={sentForAddressRemits}
            renderItem={item => (
              <List.Item>
                <RemitsForMeCard
                  address={address}
                  userSigner={userSigner}
                  localProvider={localProvider}
                  mainnetProvider={mainnetProvider}
                  price={price}
                  tx={tx}
                  writeContracts={writeContracts}
                  readContracts={readContracts}
                  remitId={item._id}
                  sender={item.sender}
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
        )}
      </div>
    </div>
  );
}
