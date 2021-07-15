import React from "react";
import moment from "moment";
import { StopOutlined } from "@ant-design/icons";

export default function RemitDeadline({ deadlineTimestamp, locale }) {
  const hasExpired = deadlineTimestamp < moment().unix();

  const deadlineDate = deadlineUnix => {
    const week = 604800000;
    const _now = moment().unix() * 1000;
    const _timestamp = deadlineUnix * 1000;

    const isWithinWeek = _timestamp - _now < week;
    return isWithinWeek ? moment(_timestamp).calendar() : moment(_timestamp).format("MMM DD YYYY HH:mm a");
  };
  const expiredDate = deadlineUnix => {
    return moment(deadlineUnix * 1000)
      .startOf("day")
      .fromNow();
  };

  const options = { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric" };
  return (
    <>
      {hasExpired ? (
        <>
          <StopOutlined style={{ color: "red", fontsize: 20 }} />
          &nbsp; {expiredDate(deadlineTimestamp)}
        </>
      ) : (
        deadlineDate(deadlineTimestamp)
      )}
    </>
  );
}
