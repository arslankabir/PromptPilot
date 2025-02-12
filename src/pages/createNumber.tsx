import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import ButtonEle from "../components/buttonEle";
import {
  oneClient,
  updateClient,
  buyTwilioPhone,
  availableTwilioPhone,
} from "../api/post";
import { updateUser } from "../api/Auth";
import Layout from "../components/layout";

import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import SelectField from "../components/selectField";

function CreateNumber(props: any) {
  const [valuePhone, setValuePhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [numbers, setNumbers] = useState<any[]>([]);
  const [flag, setFlag] = useState<boolean>(false);

  var index = 0;

  const getNumbers = async () => {
    index++;
    setErr("");
    setSuccess("");

    if (props.userinfo.phone) {
      setValuePhone(props.userinfo.phone);
      setFlag(true);
      return;
    } else {
      setLoading(true);
      const availablePhone = await availableTwilioPhone();
      if (availablePhone.data && availablePhone.data.numbers) {
        setNumbers(availablePhone.data.numbers);
        if (availablePhone.data.numbers.length > 0) {
          setValuePhone(availablePhone.data.numbers[0].phoneNumber);
        }
      }
      setFlag(false);
      setLoading(false);
      return;
    }
  };

  useEffect(() => {
    if (index === 0 && props.userinfo.email) {
      getNumbers();
    }
  }, [JSON.stringify(props.userinfo)]);

  // const setPhone = (val: any) => {
  //   if (!val) return;

  //   setValuePhone(val);
  // };

  const submit = async (param: boolean) => {
    setErr("");
    setSuccess("");

    setLoading(true);

    if (!param) {
      if (!valuePhone) {
        setErr("Please select phone number");
        setLoading(false);
        return;
      }
      const buyRes = await buyTwilioPhone({ phone: valuePhone });
      if (buyRes.data) {
        if (buyRes.data.err) {
          setErr(JSON.stringify(buyRes.data.err));
        }
      } else {
        setErr(JSON.stringify(buyRes.err));
      }
    }

    const number = !param ? valuePhone : "";

    const updatePool = await updateUser(
      props.userinfo.name,
      props.userinfo.lastname,
      props.userinfo.nickname,
      number,
      props.userinfo.picture
    );
    if (updatePool.err) {
      setErr(updatePool.err);
    } else {
      if (updatePool.result) {
        props.setUserinfo({
          ...props.userinfo,
          phone: number,
        });

        await updateClient({
          email: props.userinfo.email,
          name: props.userinfo.name,
          businessName: props.userinfo.nickname,
          phone: number,
        });
        setSuccess("Phone number updated successfully");
      }
    }

    setLoading(false);
  };

  return (
    <Layout userinfo={props.userinfo}>
      <div className="sub-container">
        <div className="content">
          <div className="switch-btn">
            <div
              className={`switch-item ${
                props.status === "email" ? "active" : ""
              }`}
              onClick={() => {
                props.setStatus("email");
              }}
            >
              Emails
            </div>
            <div
              className={`switch-item ${
                props.status === "phone" ? "active" : ""
              }`}
              onClick={() => {
                props.setStatus("phone");
              }}
            >
              Phone numbers
            </div>
          </div>
          <h2 className="title" style={{ marginBottom: 50 }}>
            create phone number
          </h2>
          {!flag ? (
            <>
              {/*<PhoneInput
              value={valuePhone}
              onChange={setPhone}
              defaultCountry="US"
              className="int w-full"
            />*/}
              <SelectField
                title="Select Phone Number"
                required={true}
                value={valuePhone}
                setValue={setValuePhone}
                options={numbers}
              />
              <div style={{ textAlign: "center", marginTop: 40 }}>
                <ButtonEle title="Create Number" handle={() => submit(flag)} />
              </div>
            </>
          ) : (
            <>
              <div className="intdiv">
                <p
                  className="lable"
                  style={{ textAlign: "center", marginBottom: 30 }}
                >
                  Your phone number is:{" "}
                  <span
                    style={{ fontSize: 18, color: "#239714", marginLeft: 20 }}
                  >
                    {valuePhone}
                  </span>
                </p>
              </div>
              {err && (
                <p className="err mb-3" style={{ textAlign: "center" }}>
                  {err}
                </p>
              )}
              {success && (
                <p className="success mb-3" style={{ textAlign: "center" }}>
                  {success}
                </p>
              )}
              <div style={{ textAlign: "center" }}>
                <ButtonEle title="Remove" handle={() => submit(flag)} />
              </div>
            </>
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

export default CreateNumber;
