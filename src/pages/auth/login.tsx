import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Signin } from "../../api/Auth";
import { BeatLoader } from "react-spinners";
import { Image, Button } from "react-bootstrap";

import TextField from "../../components/textField";
import ButtonEle from "../../components/buttonEle";
import SignRightImg from "../../assets/imgs/sign-right-img.png";

function Login(props: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const navigation = useNavigate();

  const onSubmit = async (event: any) => {
    event?.preventDefault();

    setLoading(true);
    const result: any = await Signin(email, password);

    if (result.status === 400) {
      setErr(result.err.message);
      setLoading(false);
    } else {
      setErr("");
      setLoading(false);
      props.setUserinfo({
        ...props.userinfo,
        email,
        name: result.data.idToken.payload.given_name,
        lastname: result.data.idToken.payload.family_name,
        picture: result.data.idToken.payload.picture
          ? result.data.idToken.payload.picture
          : "",
        nickname: result.data.idToken.payload.nickname
          ? result.data.idToken.payload.nickname
          : "",
        phone: result.data.idToken.payload.phone_number
          ? result.data.idToken.payload.phone_number
          : ""
      });
      navigation("/promptsV2");
    }
  };
  return (
    <div
      className="layout top-border d-flex align-items-center p-3"
      style={{ minHeight: "100vh" }}
    >
      <div className="container">
        <div className="d-flex align-items-center p-3">
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
                  title="Email Address"
                  placeholder="Enter your email address"
                  required={true}
                  value={email}
                  setValue={setEmail}
                />
                <TextField
                  title="Password"
                  placeholder="Type the password"
                  type="password"
                  required={true}
                  value={password}
                  setValue={setPassword}
                  err={err}
                />
                <div
                  className="w-100 overflow-auto text-right"
                  style={{ marginTop: 15 }}
                >
                  <Link className="forgot" to={"/forgot"}>
                    forgot password?
                  </Link>
                </div>
                <div style={{ textAlign: "center", marginTop: 40 }}>
                  <ButtonEle title="Login" handle={onSubmit} />
                </div>
                <div
                  style={{ textAlign: "center", marginTop: 16 }}
                  className="no-account"
                >
                  Don’t have an account? <Link to={"/signup"}>SignUp Now</Link>
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
                  onClick={() => navigation("/about")}
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

export default Login;
