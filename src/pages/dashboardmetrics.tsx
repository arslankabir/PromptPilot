import { useState, useEffect } from "react";
import { BeatLoader } from "react-spinners";

import { untiedreferrals } from "../api/post";
import Layout from "../components/layout";
import RTable from "../components/rTable";

function DashboardMetrics(props: any) {
  const [referrals, setReferrals] = useState([]);

  const [err, setErr] = useState("");

  var index = 0;

  const getReferrals = async () => {
    index++;
    setErr("");

    props.setLoading(true);
    const res = await untiedreferrals();
    if (res.data) {
      if (res.data.length > 0) {
        let arr = res.data;
        arr.sort((a: any, b: any) => {
          let da = new Date(a.date.split(".")[0]).getTime();
          let db = new Date(b.date.split(".")[0]).getTime();

          return db - da;
        });
        setReferrals(arr);
      } else {
        setReferrals([]);
        setErr("No data");
      }
    } else {
      setErr(res.err);
    }
    props.setLoading(false);
  };

  useEffect(() => {
    if (index === 0 && props.userinfo.email) getReferrals();
  }, [JSON.stringify(props.userinfo)]);

  return (
    <Layout userinfo={props.userinfo}>
      <div className="sub-container">
        <div className="content">
          <div
            className="d-md-flex justify-content-between"
            style={{ marginBottom: 20 }}
          >
            <h2 className="title">dashboard</h2>
          </div>
          {referrals.length > 0 && (
            <RTable
              columns={[
                {
                  Header: "Email",
                  accessor: "email"
                },
                {
                  Header: "Name",
                  accessor: "name"
                },
                {
                  Header: "Date",
                  accessor: "date"
                }
              ]}
              data={referrals}
            />
          )}

          {err && <p className="err p-3">{err}</p>}
          {props.loading && (
            <div className="loading">
              <BeatLoader color="#f42f3b" size={12} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default DashboardMetrics;
