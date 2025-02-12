import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Register } from "../../api/Auth";
import { BeatLoader } from "react-spinners";
import { Image, Button, Form } from "react-bootstrap";

import TextField from "../../components/textField";
import ButtonEle from "../../components/buttonEle";
import SignRightImg from "../../assets/imgs/sign-right-img.png";

enum ErrMsg {
  givenName = "Please enter your first name!",
  familyName = "Please enter your last name!",
  email = "Please enter your email address!",
  password = "Please type the password!",
  agree = "Agree terms and conditions!",
}

function Signup(props: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setErr("");
  }, [email, password, givenName, familyName, agree]);

  const navigate = useNavigate();

  const onSubmit = async (event: any) => {
    event?.preventDefault();
    if (!givenName) {
      setErr(ErrMsg.givenName);
      return;
    }
    if (!familyName) {
      setErr(ErrMsg.familyName);
      return;
    }
    if (!email) {
      setErr(ErrMsg.email);
      return;
    }
    if (!password) {
      setErr(ErrMsg.password);
      return;
    }
    if (!agree) {
      setErr(ErrMsg.agree);
      return;
    }
    setLoading(true);
    const result: any = await Register(email, password, givenName, familyName);
    if (result.status === 400) {
      setErr(result.err.message);
      setLoading(false);
    } else {
      setErr("");
      setLoading(false);
      props.setEmail(email);
      navigate("/confirmation");
    }
  };

  return (
    <div
      className="layout top-border d-flex align-items-center p-3"
      style={{ minHeight: "100vh" }}
    >
      <div className="container">
        <div
          className="d-flex align-items-center h-100"
          style={{ minHeight: "100vh" }}
        >
          <div className="w-100 d-lg-flex">
            <div className="sign-left-zone col-12 col-lg-6 d-flex justify-content-center align-items-center p-3">
              <div className="w-100" style={{ maxWidth: 500 }}>
                <h2
                  className="sign-title text-center"
                  style={{ marginBottom: 50 }}
                >
                  Reinvent
                </h2>
                <TextField
                  title="First Name"
                  placeholder="Enter your first name"
                  required={true}
                  value={givenName}
                  setValue={setGivenName}
                  style={{
                    borderColor: err === ErrMsg.givenName ? "red" : "#a1d4c6",
                  }}
                />
                <TextField
                  title="Last Name"
                  placeholder="Enter your last name"
                  required={true}
                  value={familyName}
                  setValue={setFamilyName}
                  style={{
                    borderColor: err === ErrMsg.familyName ? "red" : "#a1d4c6",
                  }}
                />
                <TextField
                  title="Email Address"
                  placeholder="Enter your email address"
                  required={true}
                  value={email}
                  setValue={setEmail}
                  style={{
                    borderColor: err === ErrMsg.email ? "red" : "#a1d4c6",
                  }}
                />
                <TextField
                  title="Password"
                  placeholder="Type the password"
                  type="password"
                  required={true}
                  value={password}
                  setValue={setPassword}
                  style={{
                    borderColor: err === ErrMsg.password ? "red" : "#a1d4c6",
                  }}
                />
                <div className="agree" style={{ marginTop: 35 }}>
                  <Form.Check
                    type="checkbox"
                    label="By signing-up you agree to our Terms and Conditions"
                    style={{
                      borderBottom: err === ErrMsg.agree ? "1px solid red" : 0,
                    }}
                    checked={agree}
                    onChange={(e) => {
                      e.currentTarget.checked
                        ? setAgree(true)
                        : setAgree(false);
                    }}
                  />
                </div>
                {err && <p className="err">{err}</p>}
                <div style={{ textAlign: "center", marginTop: 40 }}>
                  <ButtonEle title="Create account" handle={onSubmit} />
                </div>
                <div
                  style={{ textAlign: "center", marginTop: 16 }}
                  className="no-account"
                >
                  Already have an account? <Link to={"/login"}>LogIn Now</Link>
                </div>
                {loading && (
                  <div className="loading">
                    <BeatLoader color="#f42f3b" size={12} />
                  </div>
                )}
              </div>
            </div>
            <div className="d-none sign-right-zone d-lg-flex justify-content-center align-items-center col-6">
              <div style={{ maxWidth: 600, position: "relative" }}>
                <Image src={SignRightImg} alt="" className="w-50" />
                <h2 style={{ marginTop: 56 }}>Viral Marketing powered by AI</h2>
                <p style={{ marginTop: 20 }}>
                  Reach more people and convert them into users and paying
                  customers.
                </p>
                <Button
                  className="learn-more-btn"
                  style={{ marginTop: 26 }}
                  onClick={() => navigate("/about")}
                >
                  Learn more
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
