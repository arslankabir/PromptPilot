import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmCognitoUser } from "../../api/Auth";
import { BeatLoader } from "react-spinners";
import { Image, Button } from "react-bootstrap";

import TextField from "../../components/textField";
import ButtonEle from "../../components/buttonEle";
import SignRightImg from "../../assets/imgs/sign-right-img.png";

function ConfirmUser(props: any) {
  const navigate = useNavigate();

  const [email, setEmail] = useState(props.email);
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: any) => {
    event?.preventDefault();
    if (!email || !code) return;

    const result: any = await ConfirmCognitoUser(email, code);
    if (result.status === 400) {
      setErr(result.err.message);
      setLoading(false);
    } else {
      setErr("");
      setLoading(false);
      navigate("/login");
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
                  confirmation
                </h2>
                <TextField
                  title="Email Address"
                  placeholder="Enter your email address"
                  required={true}
                  value={email}
                  setValue={setEmail}
                  err={err}
                />
                <TextField
                  title="Code"
                  placeholder="Type the code"
                  required={true}
                  value={code}
                  setValue={setCode}
                  err={err}
                />
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

export default ConfirmUser;
