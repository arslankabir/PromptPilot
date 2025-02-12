/* eslint-disable */
// @ts-nocheck

import React, { useState, useEffect } from "react";
import { BeatLoader } from "react-spinners";
import S3FileUpload from "react-s3";
import { oneClient, updateClient } from "../api/post";

import TextField from "../components/textField";
import ButtonEle from "../components/buttonEle";
import Layout from "../components/layout";
import { updateUser } from "../api/Auth";

const config = {
  bucketName: process.env.REACT_APP_AWS_BUCKET,
  accessKeyId: process.env.REACT_APP_AWS_ACCESSKEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
};

function Profile(props: any) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File>();

  const handleFileChange = (e: any) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    setEmail(props.userinfo.email);
    setName(props.userinfo.name);
    setLastName(props.userinfo.lastname);
    setBusinessName(props.userinfo.nickname);
  }, [JSON.stringify(props.userinfo)]);

  const onSubmit = async (event: any) => {
    event?.preventDefault();

    setErr("");
    setSuccess("");

    let pictureURL = props.userinfo.picture;
    setLoading(true);
    if (file) {
      const uploadRes = await S3FileUpload.uploadFile(file, config);
      if (uploadRes && uploadRes.location) {
        pictureURL = uploadRes.location;
      }
    }

    const updatePool = await updateUser(
      name,
      lastName,
      businessName,
      props.userinfo.phone,
      pictureURL
    );
    if (updatePool.err) {
      setErr(updatePool.err);
    } else {
      if (updatePool.result) {
        props.setUserinfo({
          ...props.userinfo,
          email,
          name,
          lastname: lastName,
          nickname: businessName,
          picture: pictureURL,
        });

        await updateClient({
          email: props.userinfo.email,
          name,
          businessName,
          phone: props.userinfo.phone,
        });
        setSuccess("Profile updated successfully");
      }
    }

    setLoading(false);
  };
  return (
    <Layout userinfo={props.userinfo}>
      <div className="sub-container">
        <div className="content">
          <h2 className="title" style={{ marginBottom: 50 }}>
            profile
          </h2>
          <TextField
            title="Email Address"
            placeholder="Enter your email address"
            required={true}
            value={email}
            disabled={true}
            setValue={setEmail}
          />
          <TextField
            title="First Name"
            placeholder="Type your first name"
            required={false}
            value={name}
            setValue={setName}
          />
          <TextField
            title="Last Name"
            placeholder="Type your last name"
            required={false}
            value={lastName}
            setValue={setLastName}
          />
          <TextField
            title="Business Name"
            placeholder="Type your business name"
            required={false}
            value={businessName}
            setValue={setBusinessName}
          />
          <div className="intdiv">
            <p className="lable">Picture</p>
            <input className="int" type="file" onChange={handleFileChange} />
            {err && <p className="err">{err}</p>}
            {success && <p className="success">{success}</p>}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <ButtonEle title="Save" handle={onSubmit} />
          </div>
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

export default Profile;
