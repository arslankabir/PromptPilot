import { useState, useEffect } from "react";
import Layout from "../components/layout";
import { referrals, allReferrals, referrers } from "../api/post";
import { BeatLoader } from "react-spinners";
import { Table, Pagination } from "react-bootstrap";
import SelectField from "../components/selectField";

function UserList(props: any) {
  const [userlist, setUserlist] = useState([]);
  const [showUserlist, setShowUserlist] = useState([]);
  const [err, setErr] = useState("");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(false);
  const [campaignIds, setCampaignIds] = useState(["All"]);

  const [step, setStep] = useState<number>(10);
  const [offset, setOffset] = useState(0);
  const [pages, setPages] = useState(0);
  const [current, setCurrent] = useState(1);

  let index = 0;
  const getReferrers = async () => {
    index++;
    setErr("");

    const res = await referrers({ email: props.userinfo.email });
    if (res.data) {
      if (res.data.data) {
        if (res.data.data.length > 0) {
          let arr = ["All"];
          for (let i = 0; i < res.data.data.length; i++) {
            arr.push(res.data.data[i].url);
          }
          setCampaignIds(arr);
        }
      } else {
        setErr(res.err);
      }
    } else {
      setErr(res.err);
    }
  };

  const getReferrals = async (code: string) => {
    setErr("");

    setLoading(true);
    const res = await referrals({ code });
    if (res.data) {
      if (res.data.length > 0) {
        setUserlist(res.data);
      } else {
        setUserlist([]);
        setErr("No data");
      }
    } else {
      setErr(res.err);
    }
    setLoading(false);
  };

  const getAllReferrals = async () => {
    setErr("");

    setLoading(true);
    const res = await allReferrals({ email: props.userinfo.email });
    if (res.data) {
      if (res.data.length > 0) {
        setUserlist(res.data);
      } else {
        setUserlist([]);
        setErr("No data");
      }
    } else {
      setErr(res.err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (index === 0 && props.userinfo.email) {
      getReferrers();
    }

    if (status === "All") {
      if (props.userinfo.email) {
        getAllReferrals();
      }
    } else {
      getReferrals(status);
    }
  }, [status, props.userinfo.email]);

  useEffect(() => {
    if (userlist.length > 0) {
      setShowUserlist(userlist.slice(offset, offset + step));
      setPages(Math.ceil(userlist.length / step));
    }
  }, [userlist.length, step, offset]);

  useEffect(() => {
    setOffset((current - 1) * step);
  }, [current]);

  useEffect(() => {
    if (showUserlist.length === 0 && current > 1) {
      setCurrent(1);
    }
  }, [showUserlist]);

  const paginate = (param: string) => {
    if (param === "next") {
      if (current < pages) setCurrent(current + 1);
    } else if (param === "prev") {
      if (current > 1) setCurrent(current - 1);
    } else {
      setCurrent(parseInt(param));
    }
  };

  return (
    <Layout userinfo={props.userinfo}>
      <div className="sub-container">
        <div className="content">
          <h2 className="title" style={{ marginBottom: 20 }}>
            user list
          </h2>
          <SelectField
            title="Select Campaign"
            required={true}
            value={status}
            setValue={setStatus}
            type="val"
            options={campaignIds}
          />
          {userlist.length > 0 && (
            <div className="mt-1">
              <Table responsive className="campaign-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {showUserlist.map((item: any, index: number) => (
                    <tr key={index} className="data-row">
                      <td>{item.email}</td>
                      <td>{item.name}</td>
                      <td>{item.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="display d-lg-flex">
                <div className="d-flex align-items-center my-2">
                  <div>
                    Displaying{" "}
                    <span className="colored">{showUserlist.length}</span> out
                    of <span className="colored">{userlist.length}</span> |
                    Displaying Per Row
                  </div>
                  <div>
                    <select
                      value={step}
                      onChange={(e) => setStep(parseInt(e.target.value))}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={30}>30</option>
                    </select>
                  </div>
                </div>
                <div className="my-2" style={{ width: "max-content" }}>
                  <Pagination>
                    <Pagination.Item onClick={() => paginate("prev")}>
                      {"<"}
                    </Pagination.Item>
                    {Array(pages)
                      .fill(1)
                      .map((items: any, index: number) => (
                        <Pagination.Item
                          key={index}
                          active={current === index + 1}
                          onClick={() => paginate((index + 1).toString())}
                        >
                          {index + 1}
                        </Pagination.Item>
                      ))}
                    <Pagination.Item onClick={() => paginate("next")}>
                      {">"}
                    </Pagination.Item>
                  </Pagination>
                </div>
              </div>
            </div>
          )}
          {err && <p className="err p-3">{err}</p>}
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

export default UserList;
