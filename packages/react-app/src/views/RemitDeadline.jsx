import React from "react";
import moment from "moment";
import { StopOutlined } from "@ant-design/icons";

export default function RemitDeadline({ deadlineTimestamp, remitHasSettled }) {
  const hasExpired = deadlineTimestamp < moment().unix();

  const deadlineDate = deadlineUnix => {
    const week = 604800000;
    const _now = moment().unix() * 1000;
    const _timestamp = deadlineUnix * 1000;
    const isWithinWeek = _timestamp - _now < week;
    return isWithinWeek ? moment(_timestamp).calendar() : moment(_timestamp).format("MMM DD YYYY HH:mm a");
  };

  const expiredDate = deadlineUnix => {
    return moment(deadlineUnix * 1000).fromNow();
  };

  const options = { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric" };
  return (
    <>
      {hasExpired ? (
        remitHasSettled ? (
          <>
            <span style={{ color: "grey" }}>{"REFUNDED"}</span>
          </>
        ) : (
          <>
            <StopOutlined style={{ color: "red", fontsize: 20 }} />
            &nbsp;<span style={{ color: "red" }}> {expiredDate(deadlineTimestamp)}</span>
          </>
        )
      ) : remitHasSettled ? (
        <>
          <span style={{ color: "grey" }}>{"WITHDRAWN"}</span>
        </>
      ) : (
        <>
          <span style={{ color: "green" }}>{deadlineDate(deadlineTimestamp)}</span>
        </>
      )}
    </>
  );
}
