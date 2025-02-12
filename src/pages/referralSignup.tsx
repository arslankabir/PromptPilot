import { useState, useEffect } from "react";
import { BeatLoader } from "react-spinners";
import { useParams } from "react-router-dom";
import { decrypt, decrypt1 } from "../service";
import { Image, Table } from "react-bootstrap";
import TextField from "../components/textField";
import ButtonEle from "../components/buttonEle";
import SignRightImg from "../assets/imgs/sign-right-img.png";
import CopyPanel from "../components/copyPanel";
import UpdateCopyPanel from "../components/updateCopyPanel";
import ShareSocial from "../components/shareSocial";
import UpdateShareSocial from "../components/updateShareSocial";
import { sendMails, oneClientByReferrer } from "../api/post";
import TicketSimpleImg from "../assets/imgs/tickets-simple.png";
import DoubleChevron from "../assets/imgs/double-chevron.png";
import VideoScreen from "../assets/imgs/video.png";

import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

function ReferralSignup(props: any) {
  const params = useParams();

  const [type, setType] = useState("referral");
  const [rewardArr, setRewardArr] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gmailContacts, setGmailContacts] = useState<string[]>([]);
  const [gmailOptions, setGmailOptions] = useState([]);
  const [gmailMessageId, setGmailMessageId] = useState("");

  const [oauthErr, setOauthErr] = useState("");
  const [oauthParam, setOauthParam] = useState("");
  const [oauthToken, setOauthToken] = useState({});

  var index = 0;

  useEffect(() => {
    const getClientByReferrer = async (referrer: string) => {
      index++;
      setLoading(true);
      const clientCampaign = await oneClientByReferrer({
        referrer: referrer.substring(0, 4)
      });
      if (clientCampaign.data.Item && clientCampaign.data.Item.reward) {
        setRewardArr(JSON.parse(clientCampaign.data.Item.reward.S));
      }
      props.setReferral(referrer);
      setLoading(false);
    };

    if (index === 0 && params && params.code) {
      const referralValue = decrypt(params.code.replace(/(crypt)/gm, "/"));
      if (params.referrer) {
        props.setReferrer(params.referrer.replace(/(crypt)/gm, "/"));
        setLoading(false);

        const queryString = window.location.search;
        const urlParams: any = new URLSearchParams(queryString);
        if (urlParams.get("state")) {
          const state = JSON.parse(
            decrypt1(urlParams.get("state").replace(/ /gm, "+"))
          );
          console.log(state);
          if (state.param) {
            setOauthParam(state.param);
          }
          if (state.contacts) {
            setGmailContacts(state.contacts);
          }
          if (state.email && state.id) {
            props.setUserinfo({
              ...props.userinfo,
              id: state.id,
              email: state.email
            });
          }
          if (state.messageId) {
            setGmailMessageId(state.messageId);
          }
          if (state.options) {
            setGmailOptions(state.options);
          }
          if (state.error) {
            setOauthErr(state.error);
          }
          if (state.token) {
            setOauthToken(state.token);
          }
        }
      } else {
        getClientByReferrer(referralValue);

        if (referralValue.length === 4) {
          setType("referral");
        } else {
          setType("subreferral");
        }
      }
    }
  }, [JSON.stringify(params)]);

  const setEmail = (val: any) => {
    props.setUserinfo({
      ...props.userinfo,
      email: val
    });
  };

  const setName = (val: any) => {
    props.setUserinfo({
      ...props.userinfo,
      name: val
    });
  };

  const setPhone = (val: any) => {
    if (!val) return;

    props.setUserinfo({
      ...props.userinfo,
      phone: val
    });
  };

  useEffect(() => {
    if (props.referrer) {
      sendMails({
        fromAddress: "hello@gptloops.com",
        toAddresses: [props.userinfo.email],
        subject: "Upgrade referral link",
        content: `Here is your <a target='_blank' href='${
          window.location.origin
        }/referral/${props.referrer.replace(
          /\//g,
          "crypt"
        )}'>referral link</a>. Share this with friends and earn rewards when they sign up.`
      });
    }
  }, [props.referrer]);

  const enterSubmit = (e: any) => {
    if (e.key === "Enter") {
      props.submit(true);
    }
  };

  return (
    <div
      className="layout top-border d-flex align-items-center justify-content-center p-3"
      style={{ minHeight: "100vh" }}
    >
      {!loading && (
        <div
          className="d-flex align-items-center h-100"
          style={{ minHeight: "100vh" }}
        >
          {type === "referral" ? (
            <div className="w-100 d-lg-flex align-items-start justify-content-between">
              <div className="sign-left-zone update-left-side col-12 col-lg-8">
                <div className="w-100">
                  <div className="headline-video">
                    <p>
                      <a href="https://reinvent.co/go/1-day-virtual-event-tickets/?wvideo=ikdvqh8ah2">
                        <img src={VideoScreen} style={{ width: "100%" }} />
                      </a>
                    </p>
                  </div>
                  <div className="headline-arrow">
                    <h2
                      className="gradient"
                      style={{ fontFamily: "Muli-Bold" }}
                    >
                      Welcome! Here’s Where To Get Your Two Free Tickets To The
                      Reinvent Live 1-Day Virtual Event
                    </h2>
                    <div className="chevron">
                      <img className="chevron-1" src={DoubleChevron} alt="" />
                      <img className="chevron-2" src={DoubleChevron} alt="" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-4 p-3">
                <div className="update-right-side">
                  <img src={TicketSimpleImg} className="ticket-simple" alt="" />
                  <h3
                    className="gradient"
                    style={{
                      fontSize: "1.8em",
                      textAlign: "center",
                      fontFamily: "Muli-Bold",
                      lineHeight: "32px"
                    }}
                  >
                    Get Your Free Tickets &amp; Course
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      lineHeight: 1.4,
                      color: "#252525",
                      fontFamily: "Muli-Light",
                      marginTop: 10,
                      marginBottom: 0
                    }}
                  >
                    As <strong>our VIP guest</strong>, you can register here to
                    get your two free tickets to the Reinvent virtual live
                    experience.
                  </p>
                  <p
                    style={{
                      fontSize: 14,
                      lineHeight: 1.4,
                      color: "#252525",
                      fontFamily: "Muli-Light",
                      marginTop: 6,
                      marginBottom: 0
                    }}
                  >
                    You’ll also get our{" "}
                    <strong>
                      "Your Next Self" bonus pack of our best courses on
                      Reinvention
                    </strong>
                    . Tell us where to send your tickets:
                  </p>

                  {props.referrer ? (
                    <>
                      <h1
                        style={{
                          fontFamily: "Muli-Bold",
                          maxWidth: 480,
                          margin: "auto",
                          fontSize: "1.6em",
                          textAlign: "center",
                          marginTop: 10
                        }}
                      >
                        Click 'Email' Button To Share With Your Contacts
                      </h1>
                      <h2
                        style={{
                          fontFamily: "Muli-Regular",
                          fontSize: 13,
                          color: "#87898b",
                          textAlign: "center",
                          maxWidth: 475,
                          margin: "auto",
                          marginTop: 10
                        }}
                      >
                        Send an email to your contacts to spread the word. You
                        can use our AI-generated email template below, or copy
                        your unique referral link and create your own
                        personalized message.
                      </h2>
                      <div className="social-icons">
                        <UpdateShareSocial
                          url={`${
                            window.location.origin
                          }/referral/${props.referrer.replace(/\//g, "crypt")}`}
                          email={true}
                          encryptReferral={params.code ? params.code : ""}
                          fromAddress={props.userinfo.email}
                          id={props.userinfo.id}
                          gmailContacts={gmailContacts}
                          gmailOptions={gmailOptions}
                          gmailMessageId={gmailMessageId}
                          oauthErr={oauthErr}
                          oauthParam={oauthParam}
                          oauthToken={oauthToken}
                        />
                      </div>
                      <div className="update-copy-panel">
                        <UpdateCopyPanel
                          value={`${
                            window.location.origin
                          }/referral/${props.referrer.replace(/\//g, "crypt")}`}
                        />
                      </div>
                      <div
                        style={{
                          margin: "20px auto",
                          textAlign: "center",
                          fontFamily: "Muli-Regular",
                          fontSize: 10,
                          color: "#87898b"
                        }}
                      ></div>
                    </>
                  ) : (
                    <>
                      <div className="pb-3">
                        <TextField
                          title="Email Address"
                          required={true}
                          placeholder="Enter your email address"
                          value={props.userinfo.email}
                          setValue={setEmail}
                          onKeyUp={enterSubmit}
                        />
                        {/*<TextField
                          title="Name"
                          placeholder="Enter your name"
                          required={false}
                          value={props.userinfo.name}
                          setValue={setName}
                        />*/}

                        <div style={{ textAlign: "center", marginTop: 40 }}>
                          <ButtonEle
                            title="Continue"
                            handle={() => props.submit(false)}
                          />
                        </div>
                        {props.err && (
                          <p className="err" style={{ textAlign: "center" }}>
                            {JSON.stringify(props.err)}
                          </p>
                        )}
                        {props.loading && (
                          <div className="loading">
                            <BeatLoader color="#f42f3b" size={12} />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="container">
              <div className="w-100 d-lg-flex">
                <div className="sign-left-zone col-12 col-lg-6 d-flex justify-content-center align-items-center p-3">
                  {!props.referrer ? (
                    <div className="w-100" style={{ maxWidth: 500 }}>
                      <h2
                        className="sign-title text-center"
                        style={{
                          marginBottom: 50,
                          fontFamily: "Muli-SemiBold"
                        }}
                      >
                        Webclass Registration
                      </h2>

                      <div>
                        <TextField
                          title="Email Address"
                          required={true}
                          placeholder="Enter your email address"
                          value={props.userinfo.email}
                          setValue={setEmail}
                        />
                        <TextField
                          title="Name"
                          placeholder="Enter your name"
                          required={false}
                          value={props.userinfo.name}
                          setValue={setName}
                        />

                        <div className="intdiv">
                          <p className="lable">Phone</p>
                          <PhoneInput
                            value={props.userinfo.email.phone}
                            placeholder="Type your phone number"
                            onChange={setPhone}
                            defaultCountry="US"
                            className="int w-full"
                          />
                        </div>

                        <div style={{ textAlign: "center", marginTop: 40 }}>
                          <ButtonEle
                            title="Sign up"
                            handle={() => {
                              props.submit(true);
                            }}
                          />
                        </div>
                        {props.err && (
                          <p className="err" style={{ textAlign: "center" }}>
                            {JSON.stringify(props.err)}
                          </p>
                        )}
                      </div>

                      {props.loading && (
                        <div className="loading">
                          <BeatLoader color="#f42f3b" size={12} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-100" style={{ maxWidth: 500 }}>
                      <h2
                        className="sign-title text-center"
                        style={{
                          marginBottom: 50,
                          fontFamily: "Muli-SemiBold"
                        }}
                      >
                        share with friends and earn rewards
                      </h2>

                      <div className="mt-3">
                        <CopyPanel
                          value={`${
                            window.location.origin
                          }/referral/${props.referrer.replace(/\//g, "crypt")}`}
                        />
                      </div>
                      <div className="mt-3">
                        <ShareSocial
                          url={`${
                            window.location.origin
                          }/referral/${props.referrer.replace(/\//g, "crypt")}`}
                          email={true}
                          fromAddress={props.userinfo.email}
                        />
                      </div>

                      <p
                        style={{
                          fontFamily: "Muli-SemiBold",
                          fontSize: 14,
                          marginBottom: 20,
                          marginTop: 40,
                          color: "#1b1d20"
                        }}
                      >
                        Earn the following rewards when you sign up new users
                      </p>
                      <Table responsive className="reward-table sub">
                        <thead>
                          <tr>
                            <th
                              style={{
                                fontFamily: "Muli-Regular",
                                color: "#1b1d20",
                                fontWeight: 600
                              }}
                            >
                              Reward
                            </th>
                            <th
                              style={{
                                fontFamily: "Muli-Regular",
                                color: "#1b1d20",
                                fontWeight: 600
                              }}
                            >
                              Referrals Needed
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {rewardArr.map(
                            (
                              item: {
                                name: string;
                                subreferrals: number;
                                code: string;
                              },
                              index: number
                            ) => (
                              <tr key={index} className="data-row">
                                <td style={{ color: "#1b1d20" }}>
                                  <span className="px-2">{item.name}</span>
                                </td>
                                <td style={{ color: "#1b1d20" }}>
                                  <span className="px-2">
                                    {item.subreferrals}
                                  </span>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </div>
                <div className="d-none d-lg-block col-6 p-4">
                  <div className="d-lg-flex justify-content-center align-items-center">
                    <div
                      className="sign-right-zone"
                      style={{ maxWidth: 600, position: "relative" }}
                    >
                      <Image src={SignRightImg} alt="" className="w-50" />
                      <h2 style={{ marginTop: 56 }}>
                        Register for Eben’s FREE Webclass
                      </h2>
                      <p style={{ marginTop: 20 }}>
                        Join Eben for a free master class in coaching
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReferralSignup;
