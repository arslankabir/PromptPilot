import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { saveMessage } from "../api/post";
import { BeatLoader } from "react-spinners";
import ButtonEle from "./buttonEle";
import { oneClientById } from "../api/post";
import TextAreaField from "./textAreaField";
import { BiSave } from "react-icons/bi";
import { Button } from "react-bootstrap";

function SendMsg(props: any) {
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  var index = 0;

  useEffect(() => {
    const getClient = async () => {
      index++;
      setErr("");
      setSuccess("");

      setLoading(true);
      const res = await oneClientById({ id: props.campaignId });
      if (res.data) {
        if (res.data.Item && res.data.Item.message) {
          setMessage(res.data.Item.message.S);
        } else {
          setErr(res.data.err?.message);
        }
      } else {
        setErr(res.err);
      }

      setLoading(false);
    };

    if (index === 0 && props.campaignId) getClient();
  }, [JSON.stringify(props)]);

  const save = async (event: any) => {
    event?.preventDefault();

    setErr("");
    setSuccess("");

    if (!props.campaignId) return;

    if (!message) {
      setErr("Please insert message content!");
      return;
    }

    setLoading(true);
    const res: any = await saveMessage({
      campaignid: props.campaignId,
      message,
    });

    if (res.data) {
      if (res.data.success) {
        setSuccess("Message saved successfully");
      } else {
        setErr(res.data.err?.message);
      }
    } else {
      setErr(res.err?.message);
    }
    setLoading(false);
  };
  return (
    <>
      <TextAreaField
        title="Opening Message"
        required={true}
        value={message}
        setValue={setMessage}
        rows={5}
      />
      {err && <p className="err">{err}</p>}
      {success && <p className="success">{success}</p>}
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <Button className="btn-ele" onClick={save} style={{ width: 180 }}>
          <BiSave className="mx-1" /> Save
        </Button>
      </div>
      {loading && (
        <div className="loading">
          <BeatLoader color="#f42f3b" size={12} />
        </div>
      )}
    </>
  );
}

export default SendMsg;
