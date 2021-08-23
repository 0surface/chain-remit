import React from "react";

export default function RemitStatus(hasExpired, remitHasSettled) {
  return (
    <>
      {remitHasSettled ? (
        <>
          <span style={{ color: "grey" }}>WITHDRAWN</span>
        </>
      ) : hasExpired ? (
        <>
          <span style={{ color: "red" }}>EXPIRED</span>
        </>
      ) : (
        <>
          <span style={{ color: "green" }}>ACTIVE</span>
        </>
      )}
    </>
  );
  //   return <>{hasSettled ? <h6>REFUNDED</h6> : hasExpired ? <h6>EXPIRED</h6> : <h6>ACTIVE</h6>}</>;
}
