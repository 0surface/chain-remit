import React, { useState, useEffect } from "react";
import moment from "moment";
import { utils } from "ethers";
import clsx from "clsx";
import { Card, CardActions, CardHeader, CardContent, Collapse, IconButton, makeStyles } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Address, Balance } from "../components";
import RemitDeadline from "./RemitDeadline";
import RemitStatus from "./RemitStatus";

const useStyles = makeStyles(theme => ({
  root: {
    maxWidth: 300,
    maxHeight: 40,
  },
  media: {
    height: 0,
    paddingTop: "56.25%", // 16:9
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: "rotate(180deg)",
  },
}));

export default function RemitsForMeCard({
  address,
  mainnetProvider,
  price,
  sender,
  amount,
  deadline,
  password,
  remitHasSettled,
}) {
  const [expanded, setExpanded] = useState(false);
  const [expired, setExpired] = useState(false);
  const classes = useStyles();

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  //   const hasExpired = timestamp => {
  //     return timestamp * 1000 < Date.now();
  //   };
  useEffect(() => {
    setExpired(deadline < moment().unix());
  }, [remitHasSettled, address]);
  return (
    <div>
      <Card>
        <CardHeader
          title={<Balance balance={utils.parseEther(amount)} price={price} />}
          subheader={<RemitDeadline deadlineTimestamp={deadline} remitHasSettled={remitHasSettled} />}
        />
        <CardActions disableSpacing>
          <IconButton
            className={clsx(classes.expand, {
              [classes.expandOpen]: expanded,
            })}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </IconButton>
        </CardActions>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            {/*  */}

            <p>Plain password: {password}</p>
            {/* <p>Deadline: {moment(deadline * 1000).format()}</p> */}

            <div style={{ display: "inline-block" }}>
              From : <Address address={sender} ensProvider={mainnetProvider} fontSize={16} />
            </div>
            <div>
              To: <Address address={address} ensProvider={mainnetProvider} fontSize={16} />
            </div>
            <div>
              Status : <RemitStatus hasExpired={expired} remitHasSettled={remitHasSettled} />
            </div>
          </CardContent>
        </Collapse>
      </Card>
    </div>
  );
}
