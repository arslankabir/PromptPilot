import { useState, useEffect } from "react";
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon
} from "react-share";
import { BsEnvelopeFill } from "react-icons/bs";
import { Modal } from "react-bootstrap";
import TextField from "./textField";
import TextAreaField from "./textAreaField";
import ButtonEle from "../components/buttonEle";
import { ValidateEmail, encrypt1 } from "../service";
import { sendMails } from "../api/post";
import { BeatLoader } from "react-spinners";
import { encrypt } from "../service";

function UpdateShareSocial(props: any) {
  const [modalShow, setModalShow] = useState(false);
  const [chooseModalShow, setChooseModalShow] = useState(false);
  const [googleModalShow, setGoogleModalShow] = useState(false);
  const [toAddress, setToAddress] = useState("");
  const [success, setSuccess] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [mailType, setMailType] = useState("gmail");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

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
          `mailto:${toAddress}?subject=Reinvent&body=Sign up below: ${props.url}`,
          "_blank"
        );
      } else {
        if (props.oauthToken && props.oauthToken.access_token) {
          document.location.href = `${
            process.env.REACT_APP_BACKEND_URL
          }/?state=${encrypt(
            JSON.stringify({
              token: JSON.stringify(props.oauthToken),
              id: props.id,
              param: "send",
              redirecturl:
                window.location.origin + "/referral/" + props.encryptReferral,
              options: JSON.stringify({
                to: toAddress,
                subject: subject,
                text: content,
                textEncoding: "base64"
              }),
              contacts: JSON.stringify(props.gmailContacts)
            })
          ).replace(/(=)/gm, "@@")}`;
        } else {
          document.location.href = `https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fmail.google.com&response_type=code&client_id=${
            process.env.REACT_APP_GOOGLE_CLIENT_ID
          }&redirect_uri=${process.env.REACT_APP_BACKEND_URL}/&state=${encrypt1(
            JSON.stringify({
              id: props.id,
              param: "send",
              redirecturl:
                window.location.origin + "/referral/" + props.encryptReferral,
              options: JSON.stringify({
                to: toAddress,
                subject: subject,
                text: content,
                textEncoding: "base64"
              }),
              contacts: JSON.stringify(props.gmailContacts)
            })
          ).replace(/(=)/gm, "@@")}`;
        }
        // window.open(
        //   `https://mail.google.com/mail/?view=cm&fs=1&to=${toAddress}&su=${subject}&body=${content}`,
        //   "_blank"
        // );
      }
    }
  };

  const init = () => {
    setErr("");
    setSuccess("");
    setLoading(false);
  };

  useEffect(() => {
    setSubject("Reinvent");
    setContent(`Sign up below: ${props.url}.`);
  }, [props.url]);

  useEffect(() => {
    if (props.gmailContacts && props.gmailContacts.length > 0) {
      setGoogleModalShow(true);
    }
  }, [JSON.stringify(props.gmailContacts)]);

  useEffect(() => {
    if (props.oauthParam) {
      setToAddress(props.gmailOptions.to ? props.gmailOptions.to : "");
      setSubject(props.gmailOptions.subject ? props.gmailOptions.subject : "");
      setContent(props.gmailOptions.text ? props.gmailOptions.text : "");
    }
    if (props.gmailMessageId) {
      setSuccess("Email was sent successfully.");
    }
  }, [
    JSON.stringify(props.gmailOptions),
    props.gmailMessageId,
    props.oauthParam
  ]);

  useEffect(() => {
    if (props.oauthErr) {
      setErr(props.oauthErr);
      setGoogleModalShow(true);
    }
  }, [props.oauthErr]);

  useEffect(() => {
    setTimeout(() => {
      setSuccess("");
    }, 8000);
  }, [success]);

  return (
    <div className="d-flex align-items-center">
      <label style={{ fontFamily: "Poppins-SemiBold" }}>Write Email</label>
      {props.email && (
        <>
          <div
            className="d-flex align-items-center justify-content-center email"
            style={{ cursor: "pointer" }}
            onClick={() => {
              init();
              setChooseModalShow(true);
            }}
          >
            <div>
              <BsEnvelopeFill
                size={10}
                color="#fff"
                style={{ position: "relative", top: "-1px" }}
              />
            </div>
          </div>
          <Modal
            show={chooseModalShow}
            onHide={() => setChooseModalShow(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>Choose</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div style={{ margin: "40px auto" }}>
                <div style={{ textAlign: "center" }}>
                  <ButtonEle
                    title="Gmail Connect"
                    handle={() => {
                      document.location.href = `https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fmail.google.com&response_type=code&client_id=${
                        process.env.REACT_APP_GOOGLE_CLIENT_ID
                      }&redirect_uri=${
                        process.env.REACT_APP_BACKEND_URL
                      }/&state=${encrypt(
                        JSON.stringify({
                          id: props.id,
                          param: "contacts",
                          redirecturl:
                            window.location.origin +
                            "/referral/" +
                            props.encryptReferral,
                          options: JSON.stringify({
                            to: toAddress,
                            subject: subject,
                            text: content,
                            textEncoding: "base64"
                          })
                        })
                      ).replace(/(=)/gm, "@@")}`;
                    }}
                  />
                </div>
                <div
                  style={{
                    textAlign: "center",
                    marginTop: 20
                  }}
                >
                  <ButtonEle
                    title="Custom Email"
                    handle={() => {
                      setMailType("default");
                      setChooseModalShow(false);
                      setModalShow(true);
                    }}
                  />
                </div>
                {loading && (
                  <div className="loading">
                    <BeatLoader color="#f42f3b" size={12} />
                  </div>
                )}
              </div>
            </Modal.Body>
          </Modal>
          <Modal
            show={googleModalShow}
            onHide={() => setGoogleModalShow(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>
                {props.gmailContacts && props.gmailContacts.length > 0 ? (
                  <>Gmail Contacts</>
                ) : (
                  <>Gmail Connect</>
                )}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {props.gmailContacts &&
                props.gmailContacts.map((item: string, index: number) => (
                  <div className="intdiv" key={index}>
                    <p
                      className="lable"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setToAddress(item);
                        setGoogleModalShow(false);
                        setModalShow(true);
                        setMailType("gmail");
                      }}
                    >
                      - {item}{" "}
                    </p>
                  </div>
                ))}
              {err && <p className="err p-2">{err}</p>}
              {success && <p className="success p-2">{success}</p>}
            </Modal.Body>
          </Modal>
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
              />
              <TextField
                title="Subject"
                required={false}
                value={subject}
                setValue={setSubject}
              />
              <TextAreaField
                rows={4}
                title="Body"
                required={false}
                value={content}
                setValue={setContent}
              />
              <div style={{ textAlign: "center", marginTop: 40 }}>
                <ButtonEle title="Send Email" handle={submit} />
              </div>
              {err && <p className="err">{err}</p>}
              {success && <p className="success">{success}</p>}
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

export default UpdateShareSocial;
