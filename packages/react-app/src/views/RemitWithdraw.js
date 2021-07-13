import React, { useState } from "react";
import { Button, Input } from "antd";

const initWithdraw = {
  remitId: "",
  password: "",
  amount: 0,
};
export default function Withdraw(
  address,
  userSigner,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  writeContracts,
  readContracts,
) {
  const [withdraw, setWithdraw] = useState(initWithdraw);
  function handleSubmit(e) {
    console.log("withdraw.password::", withdraw.password);
    console.log("withdraw.amount::", withdraw.amount);
  }
  function handleChange(e) {
    e.persist();
    setWithdraw(currWithdraw => {
      return {
        ...currWithdraw,
        [e.target.id]: e.target.value,
        [`${e.target.id}Error`]: "",
      };
    });
  }
  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 550, margin: "auto", marginTop: 64 }}>
        <label>Password</label>
        <Input id="password" name="password" type="password" placeholder="password" onChange={handleChange} />
        <br />
        <>
          <Button onClick={handleSubmit}>Withdraw</Button>
        </>
      </div>
    </div>
  );
}
