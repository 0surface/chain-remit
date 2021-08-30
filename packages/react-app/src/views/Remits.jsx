import React, { useState, useEffect } from "react";
import moment from "moment";
import { Table, Switch } from "antd";
import { utils } from "ethers";
import pouchdb from "../pouchdb/pouchdb";
import { Address, Balance } from "../components";
import RemitDeadline from "./RemitDeadline";
import RemitStatus from "./RemitStatus";
import RemitDetail from "./RemitDetail";

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
  const byMeColumns = [
    {
      title: "Address",
      dataIndex: "remitter",
      key: "remitter",
      render: (text, record) => (
        <>
          <Address
            address={record.sender === address ? record.remitter : address}
            ensProvider={mainnetProvider}
            fontSize={16}
          />
        </>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text, record) => <Balance balance={utils.parseEther(record.amount)} price={price} />,
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      key: "deadline",
      render: (text, record) => (
        <RemitDeadline deadlineTimestamp={record.deadline} remitHasSettled={record.remitHasSettled} />
      ),
    },
    {
      title: "Status",
      dataIndex: "deadline",
      key: "status",
      render: (text, record) => (
        <RemitStatus hasExpired={record.deadline < moment().unix()} remitHasSettled={record.remitHasSettled} />
      ),
    },
    {
      title: "Action",
      dataIndex: "",
      key: "x",
      render: () => <a>Settle</a>,
    },
  ];

  const [remitData, setRemitData] = useState([]);
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
      setRemitData(db.map(x => ({ key: x._id, ...x })));

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
        <h3>
          TOTAL:{remitData.length} &nbsp; SETTLED:{remitData.filter(x => x.remitHasSettled).length}
        </h3>
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
          <Table
            columns={byMeColumns}
            expandable={{
              expandedRowRender: record => (
                <RemitDetail
                  address={address}
                  userSigner={userSigner}
                  localProvider={localProvider}
                  mainnetProvider={mainnetProvider}
                  price={price}
                  tx={tx}
                  writeContracts={writeContracts}
                  readContracts={readContracts}
                  record={record}
                />
              ),

              rowExpandable: record => record.name !== "Not Expandable",
            }}
            dataSource={remitData}
          />
        </>
      </div>
    </div>
  );
}
