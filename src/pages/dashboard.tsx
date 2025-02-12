import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import { Table, Pagination, Modal, Tab, Tabs } from "react-bootstrap";

import { deleteClient, referrers, updateClient } from "../api/post";
import CopyPanel from "../components/copyPanel";
import ShareSocial from "../components/shareSocial";
import CopyBtn from "../components/copyBtn";
import {
  BsCodeSlash,
  BsX,
  BsCreditCard2Front,
  BsTags,
  BsPencilFill,
  BsFillArrowUpCircleFill,
  BsFillArrowDownCircleFill
} from "react-icons/bs";

import Layout from "../components/layout";
import ButtonEle from "../components/buttonEle";
import SendMsg from "../components/sendmsg";
import { randomStringRef, encrypt, decrypt } from "../service";
import SaveReward from "../components/saveReward";
import Confirm from "../components/confirmation";
import TextField from "../components/textField";
import RTable from "../components/rTable";

function Dashboard(props: any) {
  const [campaigns, setCampaigns] = useState([]);
  const [campaignId, setCampaignId] = useState("");
  const [campaignReferral, setCampaignReferral] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const [msgShow, setMsgShow] = useState(false);
  const toggleMsgShow = () => setMsgShow(!msgShow);

  const [createShow, setCreateShow] = useState(false);
  const toggleCreateShow = () => setCreateShow(!createShow);

  const [editShow, setEditShow] = useState(false);
  const toggleEditShow = () => setEditShow(!editShow);

  const [embedShow, setEmbedShow] = useState(false);
  const toggleEmbedShow = () => setEmbedShow(!embedShow);

  const [rewardShow, setRewardShow] = useState(false);
  const toggleRewardShow = () => setRewardShow(!rewardShow);

  const navigate = useNavigate();

  var index = 0;

  const getReferrers = async () => {
    index++;
    setErr("");

    props.setLoading(true);
    const res = await referrers({ email: props.userinfo.email });
    if (res.data) {
      if (res.data.data) {
        if (res.data.data.length > 0) {
          setCampaigns(res.data.data);
        } else {
          setCampaigns([]);
          setErr("No data");
        }
      } else {
        setErr(res.err);
      }
    } else {
      setErr(res.err);
    }
    props.setLoading(false);
  };

  useEffect(() => {
    if (index === 0 && props.userinfo.email) getReferrers();
  }, [JSON.stringify(props.userinfo)]);

  const handle = async () => {
    if (!campaignName) return;

    await props.submit(true, campaignName);
    setCampaignName("");
    toggleCreateShow();
    getReferrers();
  };

  const deleteCampaign = async (id: string) => {
    if (await Confirm("Are you sure you want to delete?")) {
      const res = await deleteClient({ id });
      if (res.data) {
        if (res.data.success) {
          getReferrers();
        } else {
          setErr(res.err);
        }
      } else {
        setErr(res.err);
      }
    }
  };

  const generateReferrer = (value: string) => {
    const code: string = randomStringRef(4);
    return encrypt(value + code);
  };

  const snippetCode = `<!-- Reward Embed Script Start -->
      <form id="sform" method="post" action="${
        process.env.REACT_APP_BACKEND_URL
      }/saveinfo" onsubmit="return false;">
        <input type="hidden" value="${randomStringRef(5)}" name="id" />
        <div>
          <p>Email Address<span style="color: #f42f3b">*</span></p>
          <input id="email" placeholder="Enter your email address" name="email" type="text" />
        </div>
        <div>
          <p>Name</p>
          <input placeholder="Enter your name" name="name" type="text" />
        </div>
        <input type="hidden" value="${campaignReferral}" name="referral" />
        <input type="hidden" value="${generateReferrer(
          decrypt(campaignReferral.replace(/(crypt)/gm, "/"))
        )}" name="referrer" />
        <button onclick="onSubmit()" style="margin-top: 20px">Submit</button>
      </form>
      <script>
        function onSubmit() {
          if (!document.getElementById("email").value) {
            document.getElementById("email").focus();
            return;
          }
          document.getElementById("sform").submit();
        }

        document.getElementById("sform").addEventListener('keypress', function(e) {
          if (e.keyCode === 13) {
            e.preventDefault();
          }
        });
      </script>
    <!-- Reward Embed Script End -->`;

  const snippetCode2 = `<!-- Webclass Embed Script Start -->
    <form id="sform" method="post" action="${
      process.env.REACT_APP_BACKEND_URL
    }/saveinfo"  onsubmit="return false;">
      <input type="hidden" value="${randomStringRef(5)}" name="id" />
      <div>
        <p>Email Address<span style="color: #f42f3b">*</span></p>
        <input id="email" placeholder="Enter your email address" name="email" type="text" />
      </div>
      <div>
        <p>Name</p>
        <input placeholder="Enter your name" name="name" type="text" />
      </div>
      <div>
        <p>Phone</p>
        <input placeholder="Type your phone number" name="phone" type="text" />
      </div>
      <input type="hidden" id="referral" value="" name="referral" />
      <input type="hidden" value="" name="referrer" />
      <button onclick="onSubmit()" style="margin-top: 20px">Submit</button>
    </form>
    <script>
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      document.getElementById("referral").value=urlParams.get('referralCode');

      function onSubmit() {
        if (!document.getElementById("email").value) {
          document.getElementById("email").focus();
          return;
        }
        document.getElementById("sform").submit();
      }

      document.getElementById("sform").addEventListener('keypress', function(e) {
        if (e.keyCode === 13) {
          e.preventDefault();
        }
      });
    </script>
  <!-- Webclass Embed Script End -->`;

  const updateCampaignName = async () => {
    props.setLoading(true);
    await updateClient({
      email: props.userinfo.email,
      campaignName: campaignName,
      id: campaignId
    });
    let campaignArr: any = [...campaigns];
    for (let k = 0; k < campaignArr.length; k++) {
      if (campaignArr[k].id === campaignId) {
        campaignArr[k].campaignName = campaignName;
        break;
      }
    }
    setCampaigns(campaignArr);

    setSuccess("The campaign name is updated.");
    setCampaignId("");
    setCampaignName("");
    toggleEditShow();

    props.setLoading(false);
  };

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        setSuccess("");
      }, 4000);
    }
  }, [success]);

  return (
    <Layout userinfo={props.userinfo}>
      <div className="sub-container">
        <div className="content">
          <div
            className="d-md-flex justify-content-between"
            style={{ marginBottom: 20 }}
          >
            <h2 className="title">dashboard</h2>
            {/*<>
            {(campaigns.length === 0 ||
              (campaigns.length > 0 &&
                campaigns[0]["type"] &&
                campaigns[0]["type"] === "creator")) && (
              <ButtonEle title="+ New campaign" handle={handle} />
            )}
            </>
            */}
            <ButtonEle title="+ New campaign" handle={toggleCreateShow} />
          </div>
          {campaigns.length > 0 && (
            <RTable
              columns={[
                {
                  Header: "Name",
                  accessor: "campaignName"
                },
                {
                  Header: "Active Campaigns",
                  accessor: "url",
                  Cell: ({ cell }: any) => (
                    <div style={{ display: "flex" }}>
                      <div>
                        {`${window.location.origin}/referral/${cell.value}`}
                      </div>
                      <div
                        style={{
                          position: "relative",
                          marginLeft: 10,
                          top: -4
                        }}
                      >
                        <CopyBtn
                          value={`${window.location.origin}/referral/${cell.value}`}
                        />
                      </div>
                    </div>
                  ),
                  disableSortBy: true
                },
                {
                  Header: "Ambassadors",
                  accessor: "count",
                  disableSortBy: true
                },
                {
                  Header: "Referrals",
                  accessor: "count1",
                  disableSortBy: true
                },
                {
                  Header: "Date",
                  accessor: "date"
                },
                {
                  Header: "Referral Rate",
                  accessor: "type",
                  Cell: ({ cell }: any) => (
                    <span>
                      {cell.row.original.count > 0
                        ? (
                            cell.row.original.count1 / cell.row.original.count
                          ).toFixed(2)
                        : 0}
                    </span>
                  )
                },
                {
                  Header: "Actions",
                  accessor: "id",
                  Cell: ({ cell }: any) => (
                    <div className="data-row d-flex justify-content-center">
                      <div
                        className="analytics pt-1"
                        onClick={() =>
                          navigate(`/campaigns/${cell.row.original.url}`)
                        }
                        style={{ marginLeft: 20 }}
                      >
                        <div>
                          <svg
                            width="19"
                            height="19"
                            viewBox="0 0 19 19"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3.5 1.83331H2V16.8333H17V15.3333H3.5V1.83331Z"
                              fill="#5D6676"
                            />
                            <path
                              d="M14.75 3.33329C14.1533 3.33329 13.581 3.57034 13.159 3.9923C12.7371 4.41425 12.5 4.98655 12.5 5.58329C12.5029 6.09081 12.6774 6.58242 12.995 6.97829L11.495 9.39329C11.0803 9.29874 10.6468 9.33008 10.25 9.48329L9.2075 8.22329C9.40442 7.87597 9.50537 7.48251 9.5 7.08329C9.5 6.63828 9.36804 6.20326 9.12081 5.83325C8.87357 5.46324 8.52217 5.17485 8.11104 5.00456C7.6999 4.83426 7.2475 4.7897 6.81105 4.87652C6.37459 4.96334 5.97368 5.17763 5.65901 5.4923C5.34434 5.80696 5.13005 6.20788 5.04323 6.64433C4.95642 7.08079 5.00097 7.53319 5.17127 7.94432C5.34157 8.35546 5.62996 8.70686 5.99997 8.95409C6.36998 9.20133 6.80499 9.33329 7.25 9.33329C7.50673 9.32646 7.76039 9.27572 8 9.18329L9.0425 10.4433C8.84558 10.7906 8.74463 11.1841 8.75 11.5833C8.75 12.18 8.98705 12.7523 9.40901 13.1743C9.83097 13.5962 10.4033 13.8333 11 13.8333C11.5967 13.8333 12.169 13.5962 12.591 13.1743C13.0129 12.7523 13.25 12.18 13.25 11.5833C13.2471 11.0758 13.0726 10.5841 12.755 10.1883L14.255 7.77329C14.5648 7.84624 14.8865 7.85264 15.199 7.79207C15.5114 7.73149 15.8074 7.60533 16.0675 7.42191C16.3276 7.23848 16.5458 7.00197 16.7077 6.72799C16.8697 6.454 16.9716 6.14879 17.0069 5.83249C17.0421 5.51619 17.0099 5.19602 16.9123 4.8931C16.8147 4.59018 16.6539 4.31142 16.4406 4.07522C16.2273 3.83902 15.9663 3.65075 15.6749 3.52286C15.3835 3.39497 15.0682 3.33035 14.75 3.33329ZM6.5 7.08329C6.5 6.93495 6.54399 6.78995 6.6264 6.66661C6.70881 6.54327 6.82594 6.44714 6.96299 6.39038C7.10003 6.33361 7.25083 6.31876 7.39632 6.3477C7.5418 6.37664 7.67544 6.44807 7.78033 6.55296C7.88522 6.65785 7.95665 6.79148 7.98559 6.93697C8.01453 7.08245 7.99968 7.23325 7.94291 7.3703C7.88614 7.50734 7.79002 7.62448 7.66668 7.70689C7.54334 7.7893 7.39834 7.83329 7.25 7.83329C7.05109 7.83329 6.86032 7.75427 6.71967 7.61362C6.57902 7.47296 6.5 7.2822 6.5 7.08329ZM11 12.3333C10.8517 12.3333 10.7067 12.2893 10.5833 12.2069C10.46 12.1245 10.3639 12.0073 10.3071 11.8703C10.2503 11.7333 10.2355 11.5825 10.2644 11.437C10.2934 11.2915 10.3648 11.1578 10.4697 11.053C10.5746 10.9481 10.7082 10.8766 10.8537 10.8477C10.9992 10.8188 11.15 10.8336 11.287 10.8904C11.4241 10.9471 11.5412 11.0433 11.6236 11.1666C11.706 11.2899 11.75 11.4349 11.75 11.5833C11.75 11.7822 11.671 11.973 11.5303 12.1136C11.3897 12.2543 11.1989 12.3333 11 12.3333ZM14.75 6.33329C14.6017 6.33329 14.4567 6.2893 14.3333 6.20689C14.21 6.12448 14.1139 6.00734 14.0571 5.8703C14.0003 5.73325 13.9855 5.58245 14.0144 5.43697C14.0434 5.29148 14.1148 5.15785 14.2197 5.05296C14.3246 4.94807 14.4582 4.87664 14.6037 4.8477C14.7492 4.81876 14.9 4.83361 15.037 4.89038C15.1741 4.94714 15.2912 5.04327 15.3736 5.16661C15.456 5.28995 15.5 5.43495 15.5 5.58329C15.5 5.7822 15.421 5.97296 15.2803 6.11362C15.1397 6.25427 14.9489 6.33329 14.75 6.33329Z"
                              fill="#5D6676"
                            />
                          </svg>
                        </div>
                        <div style={{ marginLeft: 5 }}>Analytics</div>
                      </div>
                      {/*
                            <div
                              className="analytics pt-1"
                              style={{ marginLeft: 20 }}
                              onClick={() => {
                                toggleEmbedShow();
                                setCampaignReferral(cell.row.original.url);
                              }}
                            >
                              <div>
                                <BsCodeSlash size={20} />
                              </div>
                              <div style={{ marginLeft: 5 }}>
                                Embed&nbsp;Script
                              </div>
                            </div>
                            {cell.row.original.type === "creator" && (
                              <div
                                className="analytics pt-1"
                                onClick={() => {
                                  toggleMsgShow();
                                  setCampaignId(cell.row.original.id);
                                }}
                                style={{ marginLeft: 20 }}
                              >
                                <div>
                                  <svg
                                    width="19"
                                    height="19"
                                    viewBox="0 0 19 19"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <g clipPath="url(#clip0_1_441)">
                                      <path
                                        d="M15.5 4.83331H14.75V10.8333C14.75 11.2458 14.4125 11.5833 14 11.5833H5V12.3333C5 13.1583 5.675 13.8333 6.5 13.8333H14L17 16.8333V6.33331C17 5.50831 16.325 4.83331 15.5 4.83331ZM13.25 8.58331V3.33331C13.25 2.50831 12.575 1.83331 11.75 1.83331H3.5C2.675 1.83331 2 2.50831 2 3.33331V13.0833L5 10.0833H11.75C12.575 10.0833 13.25 9.40831 13.25 8.58331Z"
                                        fill="#5D6676"
                                      />
                                    </g>
                                    <defs>
                                      <clipPath id="clip0_1_441">
                                        <rect
                                          width="18"
                                          height="18"
                                          fill="white"
                                          transform="translate(0.5 0.333313)"
                                        />
                                      </clipPath>
                                    </defs>
                                  </svg>
                                </div>
                                <div style={{ marginLeft: 5 }}>SMS</div>
                              </div>
                            )}
                            */}
                      {cell.row.original.type === "creator" && (
                        <div
                          className="analytics pt-1"
                          style={{ marginLeft: 20 }}
                          onClick={() => {
                            navigate(
                              `/campaign/${cell.row.original.url}/rewards`
                            );
                          }}
                        >
                          <div>
                            <BsCreditCard2Front size={20} />
                          </div>
                          <div style={{ marginLeft: 5 }}>Rewards</div>
                        </div>
                      )}
                      {/*
                            {cell.row.original.type === "creator" && (
                              <div
                                className="analytics pt-1"
                                style={{ marginLeft: 20 }}
                                onClick={() => {
                                  navigate(`/campaign/${cell.row.original.url}/tags`);
                                }}
                              >
                                <div>
                                  <BsTags size={20} />
                                </div>
                                <div style={{ marginLeft: 5 }}>Tags</div>
                              </div>
                            )}
                            */}
                      {cell.row.original.type === "creator" && (
                        <div
                          className="analytics delete-icon pt-1"
                          onClick={() => {
                            deleteCampaign(cell.value);
                          }}
                          style={{ marginLeft: 20 }}
                        >
                          <BsX size={25} />
                        </div>
                      )}
                      {cell.row.original.type === "creator" && (
                        <div
                          className="analytics delete-icon pt-1"
                          onClick={() => {
                            setCampaignId(cell.value);
                            setCampaignName(cell.row.original.campaignName);
                            toggleEditShow();
                          }}
                          style={{ marginLeft: 10 }}
                        >
                          <BsPencilFill />
                        </div>
                      )}
                    </div>
                  ),
                  disableSortBy: true
                }
              ]}
              data={campaigns}
            />
          )}

          {err && <p className="err p-3">{err}</p>}
          {success && <p className="success">{success}</p>}
          {props.loading && (
            <div className="loading">
              <BeatLoader color="#f42f3b" size={12} />
            </div>
          )}
        </div>
      </div>
      <Modal show={msgShow} onHide={toggleMsgShow}>
        <Modal.Header closeButton>
          <Modal.Title>Add Campaign</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <SendMsg campaignId={campaignId} />
        </Modal.Body>
      </Modal>
      <Modal show={createShow} onHide={toggleCreateShow}>
        <Modal.Header closeButton>
          <Modal.Title>Campaign name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <TextField
            title="Please insert campaign name"
            placeholder=""
            required={true}
            value={campaignName}
            setValue={setCampaignName}
          />
          <div className="mt-2" style={{ textAlign: "center" }}>
            <ButtonEle title="Save" handle={handle} />
          </div>
        </Modal.Body>
      </Modal>
      <Modal show={editShow} onHide={toggleEditShow}>
        <Modal.Header closeButton>
          <Modal.Title>Edit campaign name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <TextField
            title="Please insert campaign name"
            placeholder=""
            required={false}
            value={campaignName}
            setValue={setCampaignName}
          />
          <div className="mt-2" style={{ textAlign: "center" }}>
            <ButtonEle title="Save" handle={() => updateCampaignName()} />
          </div>
        </Modal.Body>
      </Modal>
      <Modal show={embedShow} onHide={toggleEmbedShow}>
        <Modal.Header closeButton>
          <Modal.Title>Embed&nbsp;Script</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey="reward" transition={false} className="mb-3">
            <Tab eventKey="reward" title="Reward">
              <div className="embed-script">
                {`<!-- Reward Embed Script Start -->`}
                <br />
                {`<form method="post" action="${process.env.REACT_APP_BACKEND_URL}/saveinfo">`}
                <br />
                &nbsp;
                {`<input type="hidden" value="${randomStringRef(
                  5
                )}" name="id" />`}
                <br />
                {`<div>`}
                <br />
                &nbsp;
                {`<p>Email Address<span style="color: #f42f3b">*</span></p>`}
                <br />
                &nbsp;
                {`<input placeholder="Enter your email address" name="email" type="text" />`}
                <br />
                {`</div>`}
                <br />
                {`<div>`}
                <br />
                &nbsp;{`<p>Name</p>`}
                <br />
                &nbsp;
                {`<input placeholder="Enter your name" name="name" type="text" />`}
                <br />
                {`</div>`}
                <br />
                &nbsp;
                {`<input type="hidden" value="${campaignReferral}" name="referral" />`}
                <br />
                &nbsp;
                {`<input type="hidden" value="${generateReferrer(
                  decrypt(campaignReferral.replace(/(crypt)/gm, "/"))
                )}" name="referrer" />`}
                <br />
                &nbsp;{`<input type="submit" value="submit" />`}
                <br />
                {`</form>`}
                <br />
                {`<!-- Reward Embed Script End -->`}
              </div>
              <div style={{ height: 100 }}>
                <div
                  className="copy-button"
                  style={{
                    marginTop: 20,
                    float: "right",
                    width: 100
                  }}
                >
                  <CopyBtn value={snippetCode} btn={true} />
                </div>
              </div>
            </Tab>
            <Tab eventKey="webclass" title="Webclass">
              <div className="embed-script">
                {`<!-- Webclass Embed Script Start -->`}
                <br />
                {`<form method="post" action="${process.env.REACT_APP_BACKEND_URL}/saveinfo">`}
                <br />
                &nbsp;
                {`<input type="hidden" value="${randomStringRef(
                  5
                )}" name="id" />`}
                <br />
                {`<div>`}
                <br />
                &nbsp;
                {`<p>Email Address<span style="color: #f42f3b">*</span></p>`}
                <br />
                &nbsp;
                {`<input placeholder="Enter your email address" name="email" type="text" />`}
                <br />
                {`</div>`}
                <br />
                {`<div>`}
                <br />
                &nbsp;{`<p>Name</p>`}
                <br />
                &nbsp;
                {`<input placeholder="Enter your name" name="name" type="text" />`}
                <br />
                {`</div>`}
                <br />
                {`<div>`}
                <br />
                &nbsp;{`<p>Phone</p>`}
                <br />
                &nbsp;
                {`<input placeholder="Type your phone number" name="phone" type="text" />`}
                <br />
                {`</div>`}
                <br />
                {`<input type="hidden" value="${campaignReferral}" name="referral" />`}
                <br />
                &nbsp;{`<input type="hidden" value="" name="referrer" />`}
                <br />
                &nbsp;{`<input type="submit" value="submit" />`}
                <br />
                {`</form>`}
                <br />
                {`<script>`}
                <br />
                {`const queryString = window.location.search;`}
                <br />
                {`const urlParams = new URLSearchParams(queryString);`}
                <br />
                {`document.getElementById("referral").value=urlParams.get('referralCode');`}
                <br />
                {`</script>`}
                {`<!-- Webclass Embed Script End -->`}
              </div>
              <div
                className="copy-button"
                style={{ marginTop: 20, float: "right", width: 100 }}
              >
                <CopyBtn value={snippetCode2} btn={true} />
              </div>
            </Tab>
          </Tabs>
        </Modal.Body>
      </Modal>
      <Modal show={rewardShow} onHide={toggleRewardShow}>
        <Modal.Header closeButton>
          <Modal.Title>Rewards</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <SaveReward campaignId={campaignId} />
        </Modal.Body>
      </Modal>
    </Layout>
  );
}

export default Dashboard;
