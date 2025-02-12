import { useState } from "react";
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon
} from "react-share";
import { BsEnvelopeFill } from "react-icons/bs";
import { Modal } from "react-bootstrap";
import TextField from "./textField";
import ButtonEle from "../components/buttonEle";
import { ValidateEmail, encrypt, encrypt1 } from "../service";
import { sendMails } from "../api/post";
import { BeatLoader } from "react-spinners";

function ShareSocial(props: any) {
  const [modalShow, setModalShow] = useState(false);
  const [toAddress, setToAddress] = useState("");
  const [success, setSuccess] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [mailType, setMailType] = useState("default");

  const submit = async () => {
    setErr("");
    setSuccess("");

    if (!toAddress) {
      setErr("Please enter the email!");
    } else if (!ValidateEmail(toAddress)) {
      setErr("Invaild email!");
    } else {
      // setLoading(true);
      // const res: any = await sendMails({
      //   fromAddress: props.fromAddress,
      //   toAddresses: [toAddress],
      //   subject: "Reinvent",
      //   content: props.url,
      // });

      // if (res.data) {
      //   if (res.data.success) {
      //     setSuccess("Email is sent successfully");
      //   } else {
      //     setErr(res.data.err?.message);
      //   }
      // } else {
      //   setErr(res.err);
      // }
      // setLoading(false);
      if (mailType === "default") {
        window.open(
          `mailto:${toAddress}?subject=Reinvent&body=${props.url}`,
          "_blank"
        );
      } else {
        document.location.href = `https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.send&response_type=code&client_id=${
          process.env.REACT_APP_GOOGLE_CLIENT_ID
        }&redirect_uri=${process.env.REACT_APP_BACKEND_URL}/&state=${encrypt1(
          JSON.stringify({
            param: "send",
            redirecturl: window.location.href,
            options: {
              to: toAddress,
              subject: "Reinvent",
              text: props.url,
              textEncoding: "base64"
            }
          })
        ).replace(/(=)/gm, "@@")}`;
      }
    }
  };

  const init = () => {
    setErr("");
    setSuccess("");
    setToAddress("");
  };

  return (
    <div className="d-md-flex align-items-center">
      <div className="share-title mt-2">Share:</div>
      <FacebookShareButton
        url={props.url}
        title={""}
        className="facebook d-flex align-items-center mt-2"
        style={{ marginLeft: 12 }}
      >
        <div className="mx-1">
          <FacebookIcon size={20} round />
        </div>
        <div>Facebook</div>
      </FacebookShareButton>
      <TwitterShareButton
        url={props.url}
        title={""}
        className="twitter d-flex align-items-center mt-2"
        style={{ marginLeft: 12 }}
      >
        <div className="mx-1">
          <TwitterIcon size={20} round />
        </div>
        <div>Twitter</div>
      </TwitterShareButton>
      {props.email && props.fromAddress && (
        <>
          <div
            className="twitter d-flex align-items-center mt-2"
            style={{ marginLeft: 12, cursor: "pointer", maxWidth: 110 }}
            onClick={() => {
              init();
              setModalShow(true);
            }}
          >
            <div
              className="mx-1"
              style={{
                padding: "0px 5px",
                background: "#de4141",
                borderRadius: "50%"
              }}
            >
              <BsEnvelopeFill
                size={10}
                color="#fff"
                style={{ position: "relative", top: "-1px" }}
              />
            </div>
            <div>Email</div>
          </div>
          <Modal show={modalShow} onHide={() => setModalShow(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Share your friends</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <TextField
                title="Enter the email to share with"
                placeholder=""
                required={true}
                value={toAddress}
                setValue={setToAddress}
                success={success}
                err={err}
              />
              <div className="intdiv">
                <p className="lable">Mail Type</p>
                <select
                  className="int w-full"
                  value={mailType}
                  onChange={(e) => setMailType(e.target.value)}
                >
                  <option value="gmail">Gmail</option>
                  <option value="default">Email</option>
                </select>
              </div>
              <div style={{ textAlign: "center", marginTop: 40 }}>
                <ButtonEle title="Share" handle={submit} />
              </div>
              {loading && (
                <div className="loading">
                  <BeatLoader color="#f42f3b" size={12} />
                </div>
              )}
            </Modal.Body>
          </Modal>
        </>
      )}
    </div>
  );
}

export default ShareSocial;
