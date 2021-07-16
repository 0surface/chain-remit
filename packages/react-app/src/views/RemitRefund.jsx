import React, { useState } from "react";
import { Button, Input } from "antd";
import PasswordInput from "./PasswordInput";

const initRefund = {
  remitId: "",
  password: "",
  amount: 0,
};
export default function Refund(
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
  const [refund, setRefund] = useState(initRefund);

  function handleSubmit(e) {
    console.log("refund.password::", refund.password);
    console.log("refund.amount::", refund.amount);
  }
  function handleChange(e) {
    e.persist();
    setRefund(currRefund => {
      return {
        ...currRefund,
        [e.target.id]: e.target.value,
        [`${e.target.id}Error`]: "",
      };
    });
  }
  return (
    <>
      <Input.Password
        id="password"
        name="password"
        type="password"
        placeholder="password"
        style={{ width: "auto" }}
        onChange={handleChange}
      />
      <Button onClick={handleSubmit}>Refund</Button>
    </>
  );
}
