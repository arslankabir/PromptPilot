import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation
} from "react-router-dom";
import "./App.scss";
import { randomStringRef, ValidateEmail, encrypt } from "./service";
import "bootstrap/dist/css/bootstrap.min.css";

import { saveUserinfo } from "./api/post";
import Signup from "./pages/auth/signup";
import Login from "./pages/auth/login";
import Forgot from "./pages/auth/forgot";
import ConfirmUser from "./pages/auth/confirm";
import Dashboard from "./pages/dashboard";
import Profile from "./pages/profile";
import ReferralSignup from "./pages/referralSignup";
import Campaigns from "./pages/campaigns";
import Sends from "./pages/sends";
import AboutUs from "./pages/about";
import Rewards from "./pages/rewards";
import { getUserData } from "./api/Auth";
import UserList from "./pages/userList";
import Prompt from "./pages/prompt";
import PromptV2 from "./pages/promptV2";
import Chat from "./pages/chat";
import ChatHistory from "./pages/chatHistory";
import Tos from "./pages/tos";
import Policy from "./pages/policy";
import Tags from "./pages/tags";
import DashboardAmb from "./pages/dashboardamb";
import Home from "./pages/home";
import DashboardMetrics from "./pages/dashboardmetrics";
import SendEMail from "./pages/sendemail";

function App() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [userinfo, setUserinfo] = useState<{
    id: string;
    email: string;
    name: string;
    lastname: string;
    nickname: string;
    phone: string;
    picture: string;
  }>({
    id: randomStringRef(5),
    email: "",
    name: "",
    lastname: "",
    nickname: "",
    phone: "",
    picture: ""
  });
  const [referrer, setReferrer] = useState("");
  const [referral, setReferral] = useState("");
  const [err, setErr] = useState("");

  const nav = useNavigate();

  const isUserData = async (param: string) => {
    index++;
    if (
      !location.pathname.includes("/referral/") &&
      !location.pathname.includes("/survey/") &&
      (param === "click" || (param === "reload" && location.pathname !== "/"))
    ) {
      const res = await getUserData();
      if (!res || (res && res.err)) {
        if (param === "click") {
          nav("/login");
        } else {
          nav("/");
        }
      } else {
        if (res.result) {
          const useremail = res.result.find(
            (item: any) => item.Name === "email"
          );
          const username = res.result.find(
            (item: any) => item.Name === "given_name"
          );
          const userlastname = res.result.find(
            (item: any) => item.Name === "family_name"
          );
          const usernickname = res.result.find(
            (item: any) => item.Name === "nickname"
          );
          const userphone = res.result.find(
            (item: any) => item.Name === "phone_number"
          );
          const userpicture = res.result.find(
            (item: any) => item.Name === "picture"
          );

          setUserinfo({
            ...userinfo,
            email: useremail ? useremail.Value : "",
            name: username ? username.Value : "",
            lastname: userlastname ? userlastname.Value : "",
            nickname: usernickname ? usernickname.Value : "",
            phone: userphone ? userphone.Value : "",
            picture: userpicture ? userpicture.Value : ""
          });

          if (location.pathname === "/") {
            nav("/promptsV2");
          }
        }
      }
    }
  };

  let index = 0;
  useEffect(() => {
    if (index === 0) isUserData("reload");
  }, []);

  const setEmail = (val: string) => {
    setErr("");
    if (!val) {
      setErr("Please insert your email");
      return;
    }
    if (!ValidateEmail(val)) {
      setErr("Invaild email address");
      return;
    }
    setUserinfo({ ...userinfo, email: val });
  };

  const submit = async (referrerValue: boolean, campaignName: string = "") => {
    setErr("");
    if (!userinfo.email) {
      setErr("Please insert your email");
      return;
    }
    if (!ValidateEmail(userinfo.email)) {
      setErr("Invaild email address");
      return;
    }

    // const code: string = randomStringRef(4);
    // const encryptReferrer = encrypt(referral + code);

    const code: string = randomStringRef(6);
    const encryptReferrer = referral + "" + code;
    let data = {
      ...userinfo,
      referral: encrypt(referral),
      referrer: referrerValue ? encryptReferrer : "",
      campaignName
    };

    if (location.pathname === "/dashboard") {
      data = {
        ...data,
        id: randomStringRef(5)
      };
    }

    setLoading(true);
    const res = await saveUserinfo(data);
    setLoading(false);
    if (res.data) {
      if (res.data.success) {
        setUserinfo({ ...userinfo, id: res.data.id });
        setReferrer(encryptReferrer);
      } else {
        if (res.data.err) {
          if (res.data.err.message) {
            setErr(res.data.err.message);
          } else {
            setErr(res.data.err);
          }
        }
      }
    } else {
      setErr(res.err);
    }
  };

  return (
    <Routes>
      <Route path="/" element={<Home isUserData={isUserData} />} />
      <Route
        path="/signup"
        element={<Signup email={userinfo.email} setEmail={setEmail} />}
      />
      <Route
        path="/login"
        element={<Login userinfo={userinfo} setUserinfo={setUserinfo} />}
      />
      <Route path="/forgot" element={<Forgot email={userinfo.email} />} />
      <Route
        path="/confirmation"
        element={<ConfirmUser email={userinfo.email} />}
      />
      <Route
        path="/profile"
        element={<Profile userinfo={userinfo} setUserinfo={setUserinfo} />}
      />
      <Route
        path="/dashboard"
        element={
          <Dashboard
            userinfo={userinfo}
            setUserinfo={setUserinfo}
            referrer={referrer}
            setReferrer={setReferrer}
            submit={submit}
            err={err}
            setErr={setErr}
            loading={loading}
            setLoading={setLoading}
          />
        }
      />
      <Route
        path="/ambassadors"
        element={
          <DashboardAmb
            userinfo={userinfo}
            setUserinfo={setUserinfo}
            referrer={referrer}
            setReferrer={setReferrer}
            submit={submit}
            err={err}
            setErr={setErr}
            loading={loading}
            setLoading={setLoading}
          />
        }
      />
      <Route
        path="/metrics"
        element={
          <DashboardMetrics
            userinfo={userinfo}
            setUserinfo={setUserinfo}
            referrer={referrer}
            setReferrer={setReferrer}
            submit={submit}
            err={err}
            setErr={setErr}
            loading={loading}
            setLoading={setLoading}
          />
        }
      />
      <Route
        path="/referral/:code"
        element={
          <ReferralSignup
            referral={referral}
            referrer={referrer}
            setReferral={setReferral}
            userinfo={userinfo}
            setUserinfo={setUserinfo}
            setReferrer={setReferrer}
            submit={submit}
            err={err}
            setErr={setErr}
            loading={loading}
          />
        }
      />

      <Route
        path="/referral/:code/:referrer"
        element={
          <ReferralSignup
            referral={referral}
            referrer={referrer}
            setReferral={setReferral}
            userinfo={userinfo}
            setUserinfo={setUserinfo}
            setReferrer={setReferrer}
            submit={submit}
            err={err}
            setErr={setErr}
            loading={loading}
          />
        }
      />

      <Route
        path="/campaigns/:code"
        element={<Campaigns userinfo={userinfo} />}
      />
      <Route
        path="/email"
        element={<SendEMail userinfo={userinfo} setUserinfo={setUserinfo} />}
      />
      <Route
        path="/send"
        element={<Sends userinfo={userinfo} setUserinfo={setUserinfo} />}
      />
      <Route path="/about" element={<AboutUs userinfo={userinfo} />} />
      <Route
        path="/campaign/:url/rewards"
        element={<Rewards userinfo={userinfo} />}
      />
      <Route
        path="/campaign/:url/tags"
        element={<Tags userinfo={userinfo} />}
      />
      <Route path="/users" element={<UserList userinfo={userinfo} />} />
      <Route path="/prompts" element={<Prompt userinfo={userinfo} />} />
      <Route path="/promptsV2" element={<PromptV2 userinfo={userinfo} />} />
      <Route path="/chats" element={<ChatHistory userinfo={userinfo} />} />
      <Route path="/chats/:id" element={<ChatHistory userinfo={userinfo} />} />
      <Route path="/survey/:id" element={<Chat />} />
      <Route path="/tos" element={<Tos userinfo={userinfo} />} />
      <Route path="/policy" element={<Policy userinfo={userinfo} />} />
      <Route path="/*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}

export default App;
