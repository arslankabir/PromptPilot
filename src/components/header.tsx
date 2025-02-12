import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiMenu } from "react-icons/bi";
import DefaultAvatar from "../assets/imgs/avatar.png";
import { NavDropdown, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import TextAreaField from "./textAreaField";
import { BeatLoader } from "react-spinners";
import ButtonEle from "./buttonEle";
import { sendMails } from "../api/post";
import { BsExclamationCircle } from "react-icons/bs";
import { Logout } from "../api/Auth";

function Header(props: any) {
  const [helpShow, setHelpShow] = useState(false);
  const toggleHelpShow = () => setHelpShow(!helpShow);
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const onSubmit = async (event: any) => {
    event?.preventDefault();

    setErr("");
    setSuccess("");

    if (!message) {
      setErr("Please insert message!");
      return;
    }

    setLoading(true);
    const res: any = await sendMails({
      fromAddress: props.email,
      toAddresses: ["tgb29@itaccomplish.com"],
      subject: "Help",
      content: message,
    });

    if (res.data) {
      if (res.data.success) {
        setSuccess("Message was sent successfully");
      } else {
        setErr(res.data.err?.message);
      }
    } else {
      setErr(res.err);
    }
    setLoading(false);
  };

  const logoutUser = async () => {
    await Logout();
    navigate("/");
  };

  return (
    <div className="header d-md-flex align-items-center justify-content-between">
      <BiMenu className="hamber d-md-none" size={30} onClick={props.setOpen} />
      <div className="welcome">Welcome Back, {props.given_name}</div>
      <div className="username mt-3 mt-md-0">
        <span style={{ marginRight: 4 }}>Help</span>
        <BsExclamationCircle
          size={16}
          style={{ cursor: "pointer" }}
          onClick={() => setHelpShow(true)}
        />
        <img
          className="avatar"
          src={props.picture ? props.picture : DefaultAvatar}
          alt=""
        />
        <NavDropdown
          id="nav-dropdown-dark-example"
          title={`${props.given_name} ${props.family_name}`}
          style={{ display: "inline-block", fontFamily: "Muli-Regular" }}
        >
          <Link
            style={{
              color: "#1d2126",
              fontFamily: "Muli-Regular",
              textDecoration: "none",
              width: "100%",
              display: "inline-block",
              paddingLeft: "15px",
            }}
            to={"/profile"}
          >
            Profile
          </Link>
          <NavDropdown.Divider />
          <Link
            style={{
              color: "#1d2126",
              fontFamily: "Muli-Regular",
              textDecoration: "none",
              width: "100%",
              display: "inline-block",
              paddingLeft: "15px",
            }}
            to={"#"}
            onClick={() => logoutUser()}
          >
            Logout
          </Link>
        </NavDropdown>
      </div>
      <Modal show={helpShow} onHide={toggleHelpShow}>
        <Modal.Header closeButton>
          <Modal.Title>Send us a message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <TextAreaField
            title="Message"
            required={true}
            value={message}
            setValue={setMessage}
          />
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
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Header;
