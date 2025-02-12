import { useState, useEffect } from "react";
import { BeatLoader } from "react-spinners";
import { Tab, Tabs } from "react-bootstrap";

import { allSubReferralsByEmail } from "../api/post";
import Layout from "../components/layout";
import RTable from "../components/rTable";

function DashboardAmb(props: any) {
  const [referrals, setReferrals] = useState([]);
  const [rewards, setRewards] = useState([]);

  const [err, setErr] = useState("");

  var index = 0;

  const getReferrals = async () => {
    index++;
    setErr("");

    props.setLoading(true);
    const res = await allSubReferralsByEmail({ email: props.userinfo.email });
    if (res.data) {
      if (res.data.data) {
        if (res.data.data.length > 0) {
          let arr = res.data.data;
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

      if (res.data.data && res.data.campaigns) {
        let rewardsArr: any = [];
        const campaignsArr = res.data.campaigns;
        for (let i = 0; i < campaignsArr.length; i++) {
          const camReward =
            campaignsArr[i].reward && campaignsArr[i].reward.S
              ? JSON.parse(campaignsArr[i].reward.S)
              : [];
          if (camReward.length > 0) {
            const filterSubReferrals = res.data.data.filter(
              (item: any) =>
                item.referral.substring(0, 6) === campaignsArr[i].referrer.S
            );
            const count = filterSubReferrals.length;
            for (let k = 0; k < camReward.length; k++) {
              if (
                camReward[k].subreferrals &&
                count >= parseInt(camReward[k].subreferrals)
              ) {
                rewardsArr.push(camReward[k]);
              }
            }
          }
          console.log(rewardsArr);
        }

        setRewards(rewardsArr);
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
          <Tabs defaultActiveKey="referrals" transition={true} className="mb-3">
            <Tab eventKey="referrals" title="Referrals">
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
            </Tab>
            <Tab eventKey="rewards" title="Rewards">
              <RTable
                columns={[
                  {
                    Header: "Name",
                    accessor: "name"
                  },
                  {
                    Header: "Reward Promo Code",
                    accessor: "code"
                  }
                ]}
                data={rewards}
              />
            </Tab>
          </Tabs>
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

export default DashboardAmb;
