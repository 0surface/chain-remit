import React, { useState } from "react";
import { Button, Input } from "antd";

export default function PasswordInput({ password, id }) {
  return (
    <>
      <Input.Password id={id} name="password" type="password" placeholder="password" style={{ width: "auto" }} />
    </>
  );
}
