import React, { useState, useEffect } from "react";
import { allReferrals, sendMailstoAmbsandReferrals } from "../api/post";
import { BeatLoader } from "react-spinners";
import TextField from "../components/textField";
import ButtonEle from "../components/buttonEle";
import { ValidateEmail, encrypt, decrypt, encrypt1 } from "../service";
import Layout from "../components/layout";
import { BsX } from "react-icons/bs";
import { Button } from "react-bootstrap";
import { EditorState, Modifier, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import EditorComponent from "../components/editor";

function SendEMail(props: any) {
  const [destination, setDestination] = useState<
    { address: string; link: string }[]
  >([]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [totalReferralData, setTotalReferralData] = useState([]);
  const [totalCampaignData, setTotalCampaignData] = useState<any[]>([]);
  const [ambassadors, setAmbassadors] = useState<
    { address: string; link: string }[]
  >([]);
  const [referrals, setReferrals] = useState<
    { address: string; link: string }[]
  >([]);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [prelink, setPrelink] = useState("share1");

  const initialState = () => EditorState.createEmpty();
  const [editorState, setEditorState] = useState(initialState);

  const sendTextToEditor = (text: string) => {
    setEditorState(insertText(text, editorState));
  };

  useEffect(() => {
    setContent(draftToHtml(convertToRaw(editorState.getCurrentContent())));
  }, [editorState]);

  var index = 0;
  useEffect(() => {
    const getAllReferrals = async () => {
      index++;
      setLoading(true);
      const res = await allReferrals();
      if (res.data) {
        if (res.data.campaigns && res.data.campaigns.length > 0) {
          setTotalCampaignData(res.data.campaigns);
        }
        if (res.data.referrals && res.data.referrals.length > 0) {
          setTotalReferralData(res.data.referrals);

          let ambassadorsArr: {
            address: string;
            link: string;
          }[] = [];
          let referralArr: {
            address: string;
            link: string;
          }[] = [];

          for (let i = 0; i < res.data.referrals.length; i++) {
            if (!ValidateEmail(res.data.referrals[i].email)) continue;

            const extAmb = ambassadorsArr.find(
              (item: any) => item.address === res.data.referrals[i].email
            );
            if (!extAmb && res.data.referrals[i].type === "Referral") {
              ambassadorsArr.push({
                address: res.data.referrals[i].email,
                link: `ambasadorurl=${res.data.referrals[i].referrer}`
              });
            }

            const extRef = referralArr.find(
              (item: any) => item.address === res.data.referrals[i].email
            );
            if (!extRef && res.data.referrals[i].type === "Sub-referral") {
              referralArr.push({
                address: res.data.referrals[i].email,
                link: `https://www.upgrademe.ai/invite`
              });
            }
          }
          setAmbassadors(ambassadorsArr);
          setReferrals(referralArr);
        } else {
          setErr("No recipients");
        }
      } else {
        setErr(res.err);
      }
      setLoading(false);
    };

    if (index === 0) getAllReferrals();
  }, []);

  useEffect(() => {
    let destinationArr: {
      address: string;
      link: string;
    }[] = [];

    if (recipients.includes("All ambassadors")) {
      destinationArr = ambassadors;
    }

    //To get ambassadors
    for (let k = 0; k < totalCampaignData.length; k++) {
      if (!recipients.includes(totalCampaignData[k].campaignName.S)) continue;

      let ambArr: any = totalReferralData.filter(
        (item: any) =>
          item.campaignName === totalCampaignData[k].campaignName.S &&
          item.type === "Referral"
      );
      for (let n = 0; n < ambArr.length; n++) {
        if (!ValidateEmail(ambArr[n].email)) continue;

        const ext = destinationArr.find(
          (item: any) => item.address === ambArr[n].email
        );
        if (!ext) {
          destinationArr.push({
            address: ambArr[n].email,
            link: `ambasadorurl=${ambArr[n].referrer}`
          });
        }
      }
    }
    //To get referrals
    for (let k = 0; k < totalCampaignData.length; k++) {
      if (!recipients.includes(totalCampaignData[k].campaignName.S)) continue;

      let refArr: any = totalReferralData.filter(
        (item: any) =>
          item.campaignName === totalCampaignData[k].campaignName.S &&
          item.type === "Sub-referral"
      );
      for (let n = 0; n < refArr.length; n++) {
        if (!ValidateEmail(refArr[n].email)) continue;

        const ext = destinationArr.find(
          (item: any) => item.address === refArr[n].email
        );
        if (!ext) {
          destinationArr.push({
            address: refArr[n].email,
            link: `https://www.upgrademe.ai/invite`
          });
        }
      }
    }

    if (recipients.includes("All referrals")) {
      for (let k = 0; k < referrals.length; k++) {
        const ext = destinationArr.find(
          (item: any) => item.address === referrals[k].address
        );
        if (!ext) {
          destinationArr.push(referrals[k]);
        }
      }
    }

    if (recipients.includes("test")) {
      destinationArr = [];
      const testList = [
        "dev.noikeo@gmail.com",
        "tedbrink29@gmail.com",
        "tgb29@itaccomplish.com",
        "james.theo222@gmail.com",
        "tgb29@cornell.edu",
        "tgb29@me.com"
      ];

      let ambArr: any = totalReferralData.filter(
        (item: any) => testList.includes(item.email) && item.type === "Referral"
      );

      for (let k = 0; k < ambArr.length; k++) {
        const ext = destinationArr.find(
          (item: any) => item.address === ambArr[k].email
        );
        if (!ext) {
          destinationArr.push({
            address: ambArr[k].email,
            link: `ambasadorurl=${ambArr[k].referrer}`
          });
        }
      }

      let refArr: any = totalReferralData.filter(
        (item: any) =>
          testList.includes(item.email) && item.type === "Sub-referral"
      );

      for (let k = 0; k < refArr.length; k++) {
        const ext = destinationArr.find(
          (item: any) => item.address === refArr[k].email
        );
        if (!ext) {
          destinationArr.push({
            address: refArr[k].email,
            link: `https://www.upgrademe.ai/invite`
          });
        }
      }
    }

    setDestination(destinationArr);
  }, [recipients, ambassadors, referrals]);

  useEffect(() => {
    if (err || success) {
      setTimeout(() => {
        setErr("");
        setSuccess("");
      }, 4000);
    }
  }, [err, success]);

  const onSubmit = async (event: any) => {
    event?.preventDefault();

    setErr("");
    setSuccess("");

    if (!subject) {
      setErr("Please insert email subject!");
      return;
    }

    if (!content) {
      setErr("Please insert email content!");
      return;
    }

    const toAddresses: { address: string; link: string }[] = destination;

    if (toAddresses.length === 0) {
      setErr("No destinations!");
      return;
    }

    setLoading(true);
    const res: any = await sendMailstoAmbsandReferrals({
      toAddresses,
      subject,
      content,
      prelink
    });

    if (res.data) {
      if (res.data.success) {
        setSuccess("Emails are sent successfully");
      } else {
        setErr(res.data.err?.message);
      }
    } else {
      setErr(res.err);
    }
    setLoading(false);
  };

  const insertText = (text: string, editorValue: any) => {
    const currentContent = editorValue.getCurrentContent();
    const currentSelection = editorValue.getSelection();

    const newContent = Modifier.replaceText(
      currentContent,
      currentSelection,
      text
    );

    const newEditorState = EditorState.push(
      editorValue,
      newContent,
      "insert-characters"
    );
    return EditorState.forceSelection(
      newEditorState,
      newContent.getSelectionAfter()
    );
  };

  return (
    <Layout userinfo={props.userinfo}>
      <div className="sub-container">
        <div className="content">
          <h2 className="title" style={{ marginBottom: 25 }}>
            send emails
          </h2>
          <TextField
            title="Subject"
            required={true}
            value={subject}
            setValue={setSubject}
          />
          <div className="intdiv">
            <div className="d-md-flex align-items-center">
              <p className="lable">
                Content
                <span>*</span>
                <Button
                  variant="warning"
                  onClick={() => sendTextToEditor("referral_link")}
                  style={{
                    fontSize: 13,
                    padding: "5px 10px",
                    fontFamily: "Muli-SemiBold",
                    color: "#567a73",
                    marginLeft: 20
                  }}
                >
                  referral_link
                </Button>
              </p>
              <select
                className="int m-2"
                value={prelink}
                style={{ width: 150, fontSize: 13, padding: 6 }}
                onChange={(e) => setPrelink(e.target.value)}
              >
                <option value="share1">Ambassador page</option>
                <option value="intro">Referral link</option>
              </select>
            </div>
            <EditorComponent
              editorState={editorState}
              setEditorState={setEditorState}
            />
          </div>
          <div className="intdiv">
            <p className="lable mb-2">
              Recipients
              <span>*</span>
              {recipients.map((item: string, index: number) => (
                <span key={index} className="tag">
                  {item}
                  <BsX
                    onClick={() => {
                      let arr = recipients.filter((i) => i !== item);
                      setRecipients(arr);
                    }}
                  />
                </span>
              ))}
            </p>
            <select
              className="int w-full"
              value=""
              onChange={(e) => {
                if (!recipients.includes(e.target.value))
                  setRecipients((current) => [...current, e.target.value]);
              }}
            >
              <option></option>
              {ambassadors.length > 0 && (
                <option value="All ambassadors">All ambassadors</option>
              )}
              {referrals.length > 0 && (
                <option value="All referrals">All referrals</option>
              )}
              {totalCampaignData.length > 0 &&
                totalCampaignData.map((item: any, index: number) => (
                  <option
                    key={index}
                    value={item.campaignName ? item.campaignName.S : ""}
                  >
                    {item.campaignName ? item.campaignName.S : ""}
                  </option>
                ))}
              <option value="test">Test</option>
            </select>
          </div>
          {err && <p className="err">{err}</p>}
          {success && <p className="success">{success}</p>}
          {!loading && (
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <ButtonEle title="Send" handle={onSubmit} />
            </div>
          )}
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

export default SendEMail;
