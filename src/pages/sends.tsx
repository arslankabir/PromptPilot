import { useState } from "react";
import Layout from "../components/layout";
import SendMails from "./sendmails";
import CreateNumber from "./createNumber";

function Sends(props: any) {
  const [status, setStatus] = useState("email");
  return (
    <>
      {status === "email" ? (
        <SendMails
          userinfo={props.userinfo}
          status={status}
          setStatus={setStatus}
        />
      ) : (
        <CreateNumber
          userinfo={props.userinfo}
          setUserinfo={props.setUserinfo}
          status={status}
          setStatus={setStatus}
        />
      )}
    </>
  );
}

export default Sends;
