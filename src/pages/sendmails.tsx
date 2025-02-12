import React, { useState, useEffect } from "react";
import { sendMails } from "../api/post";
import { BeatLoader } from "react-spinners";
import TextField from "../components/textField";
import ButtonEle from "../components/buttonEle";
import { ValidateEmail, encrypt, decrypt, encrypt1 } from "../service";
import Layout from "../components/layout";
import TextAreaField from "../components/textAreaField";

function SendMails(props: any) {
  const [destination, setDestination] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [mailType, setMailType] = useState("default");

  const onSubmit = async (event: any) => {
    event?.preventDefault();

    setErr("");
    setSuccess("");

    if (!props.userinfo.email) {
      setErr("Please login!");
      return;
    }

    if (!subject) {
      setErr("Please insert email subject!");
      return;
    }

    if (!content) {
      setErr("Please insert email content!");
      return;
    }

    const toAddresses: string[] = [];
    const arr = destination.split(",");
    for (let i = 0; i < arr.length; i++) {
      if (ValidateEmail(arr[i].trim())) toAddresses.push(arr[i].trim());
    }

    if (toAddresses.length === 0) {
      setErr("Please insert valid destinations!");
      return;
    }

    // setLoading(true);
    // const res: any = await sendMails({
    //   fromAddress: props.userinfo.email,
    //   toAddresses,
    //   subject,
    //   content,
    // });

    // if (res.data) {
    //   if (res.data.success) {
    //     setSuccess("Emails are sent successfully");
    //   } else {
    //     setErr(res.data.err?.message);
    //   }
    // } else {
    //   setErr(res.err);
    // }
    // setLoading(false);
    if (mailType === "default") {
      window.open(
        `mailto:${toAddresses.toString()}?subject=${subject}&body=${content}`,
        "_blank"
      );
    } else {
      document.location.href = `https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.send&response_type=code&client_id=${
        process.env.REACT_APP_GOOGLE_CLIENT_ID
      }&redirect_uri=${process.env.REACT_APP_BACKEND_URL}/&state=${encrypt1(
        JSON.stringify({
          param: "send",
          redirecturl: window.location.origin + "/send",
          options: JSON.stringify({
            to: toAddresses.toString(),
            subject: subject,
            text: content,
            textEncoding: "base64"
          })
        })
      ).replace(/(=)/gm, "@@")}`;
    }
  };

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams: any = new URLSearchParams(queryString);
    if (urlParams.get("state")) {
      const state = JSON.parse(
        decrypt(urlParams.get("state").replace(/ /gm, "+"))
      );

      if (state.messageId && state.options) {
        setDestination(state.options.to ? state.options.to : "");
        setSubject(state.options.subject ? state.options.subject : "");
        setContent(state.options.text ? state.options.text : "");
        setSuccess("Emails were sent successfully");
      }
      if (state.error) {
        setErr(state.error);
      }
    }
  }, []);

  return (
    <Layout userinfo={props.userinfo}>
      <div className="sub-container">
        <div className="content">
          <div className="switch-btn">
            <div
              className={`switch-item ${
                props.status === "email" ? "active" : ""
              }`}
              onClick={() => {
                props.setStatus("email");
              }}
            >
              Emails
            </div>
            <div
              className={`switch-item ${
                props.status === "phone" ? "active" : ""
              }`}
              onClick={() => {
                props.setStatus("phone");
              }}
            >
              Phone numbers
            </div>
          </div>
          <h2 className="title" style={{ marginBottom: 25 }}>
            send emails
          </h2>
          <TextField
            title="Subject"
            required={true}
            value={subject}
            setValue={setSubject}
          />
          <TextAreaField
            title="Content"
            required={true}
            value={content}
            setValue={setContent}
          />
          <TextField
            title='Destination (seperated with " , ")'
            required={true}
            value={destination}
            setValue={setDestination}
          />
          <div className="intdiv">
            <p className="lable">Type</p>
            <select
              className="int w-full"
              value={mailType}
              onChange={(e) => setMailType(e.target.value)}
            >
              <option value="gmail">Gmail</option>
              <option value="default">Custom Email</option>
            </select>
          </div>
          {err && <p className="err">{err}</p>}
          {success && <p className="success">{success}</p>}

          <div style={{ textAlign: "center", marginTop: 40 }}>
            <ButtonEle title="Send" handle={onSubmit} />
          </div>
          {loading && (
            <div className="loading">
              <BeatLoader color="#f42f3b" size={12} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default SendMails;
