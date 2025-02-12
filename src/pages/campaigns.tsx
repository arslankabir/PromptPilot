import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import { referrals } from "../api/post";
import { dateRange, monthRange, yearlyRange } from "../service";
import Layout from "../components/layout";
import { Image, Tabs, Tab } from "react-bootstrap";
import PeopleImg from "../assets/imgs/people.png";
import ReferralImg from "../assets/imgs/referral.png";
import { BiCaretLeftCircle } from "react-icons/bi";
import { BsPencilFill } from "react-icons/bs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import Switch from "react-switch";
import RTable from "../components/rTable";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        color: "#4F4F4F",
        font: {
          family: "Inter-Regular",
          size: 12
        }
      }
    },
    yAxis: {
      min: 0
    }
  },
  scales: {
    x: {
      stacked: true,
      ticks: {
        stepSize: 1,
        color: "#4F4F4F",
        font: {
          family: "Inter-Regular",
          size: 10
        }
      }
    },
    y: {
      stacked: true,
      ticks: {
        stepSize: 1,
        color: "#4F4F4F",
        font: {
          family: "Inter-Regular",
          size: 12
        }
      }
    }
  }
};

enum AnalyticsType {
  Daily = "Daily",
  Monthly = "Monthly",
  Yearly = "Yearly"
}

function Campaigns(props: any) {
  const params = useParams();
  const navigate = useNavigate();

  const [referralArr, setReferralArr] = useState<any[]>([]);
  const [referralCount, setReferralCount] = useState(0);
  const [subReferralArr, setSubReferralArr] = useState<any[]>([]);
  const [subReferralCount, setSubReferralCount] = useState(0);
  const [userCount, setUserCount] = useState(0);

  const [totalReferralArr, setTotalReferralArr] = useState<any[]>([]);
  const [totalSubReferralArr, setTotalSubReferralArr] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [labels, setLabels] = useState<(string | number)[]>([]);
  const [data1, setData1] = useState<number[]>([]);
  const [data2, setData2] = useState<number[]>([]);
  const [analyticsType, setAnalyticsType] = useState<AnalyticsType>(
    AnalyticsType.Daily
  );
  const [err, setErr] = useState("");

  const [key, setKey] = useState("ambassadors");
  const [gmailCount, setGmailCount] = useState(0);

  const [filter, setFilter] = useState("all");
  const [unique, setUnique] = useState(false);

  var index = 0;

  useEffect(() => {
    const getReferrals = async () => {
      index++;
      setLoading(true);
      const res = await referrals({ code: params.code });
      let arr1: any = [];
      let arr2: any = [];
      let gCount = 0;
      let userArr: string[] = [];
      if (res.data.length > 0) {
        gCount = parseInt(res.data[0].gmailCounter);
        res.data.sort((a: any, b: any) => {
          let da = new Date(a.date.split(".")[0]).getTime();
          let db = new Date(b.date.split(".")[0]).getTime();

          return db - da;
        });
        for (let i = 0; i < res.data.length; i++) {
          if (res.data[i].type === "Referral") {
            arr1.push(res.data[i]);
            userArr.push(res.data[i].email);
          }
          if (res.data[i].type === "Sub-referral") {
            arr2.push(res.data[i]);
            userArr.push(res.data[i].email);
          }
        }
      } else {
        setErr("No data");
      }
      setGmailCount(gCount);
      setReferralArr(arr1);
      setReferralCount(arr1.length);
      setSubReferralArr(arr2);
      setSubReferralCount(arr2.length);
      setUserCount(userArr.length);

      setTotalReferralArr(arr1);
      setTotalSubReferralArr(arr2);

      setLoading(false);
    };
    if (params && params.code && index === 0) getReferrals();
  }, [params]);

  useEffect(() => {
    let arr1: any = [];
    let arr2: any = [];
    let userArr: string[] = [];

    const referraldata = totalReferralArr;
    const subreferraldata = totalSubReferralArr;

    if (unique) {
      for (let i = 0; i < referraldata.length; i++) {
        const ext1 = arr1.filter(
          (item: any) => item.email === referraldata[i].email
        );
        if (ext1.length === 0) {
          arr1.push(referraldata[i]);
          userArr.push(referraldata[i].email);
        }
      }
      for (let i = 0; i < subreferraldata.length; i++) {
        const ext2 = arr2.filter(
          (item: any) => item.email === subreferraldata[i].email
        );
        if (ext2.length === 0) {
          arr2.push(subreferraldata[i]);
          userArr.push(subreferraldata[i].email);
        }
      }

      setReferralArr(arr1);
      setReferralCount(arr1.length);
      setSubReferralArr(arr2);
      setSubReferralCount(arr2.length);
      setUserCount(userArr.length);
    } else {
      setReferralArr(referraldata);
      setReferralCount(referraldata.length);
      setSubReferralArr(subreferraldata);
      setSubReferralCount(subreferraldata.length);
      setUserCount(referraldata.length + subreferraldata.length);
    }
  }, [unique]);

  useEffect(() => {
    if (referralArr.length > 0) {
      let min = new Date().getTime();
      let max = new Date().getTime();
      let data1Arr = [];
      let data2Arr = [];

      for (let i = 0; i < referralArr.length; i++) {
        const itemTime = new Date(
          referralArr[i].date.substring(0, 10).trim()
        ).getTime();
        if (min > itemTime) min = itemTime;
        if (max < itemTime) max = itemTime;
      }

      for (let i = 0; i < subReferralArr.length; i++) {
        const itemTime = new Date(
          subReferralArr[i].date.substring(0, 10).trim()
        ).getTime();
        if (min > itemTime) min = itemTime;
        if (max < itemTime) max = itemTime;
      }

      if (analyticsType === AnalyticsType.Daily) {
        const dateRangeArr = dateRange(min, max);
        setLabels(dateRangeArr);

        for (let k = 0; k < dateRangeArr.length; k++) {
          const refArr = referralArr.filter(
            (item: any) =>
              item.date.substring(0, 10).trim().replace(/\//g, "-") ===
              dateRangeArr[k]
          );
          data1Arr.push(refArr.length);
          const subrefArr = subReferralArr.filter(
            (item: any) =>
              item.date.substring(0, 10).trim().replace(/\//g, "-") ===
              dateRangeArr[k]
          );
          data2Arr.push(subrefArr.length);
        }
        setData1(data1Arr);
        setData2(data2Arr);
      }

      if (analyticsType === AnalyticsType.Monthly) {
        const monthRangeArr = monthRange(max);
        setLabels(monthRangeArr);

        for (let k = 0; k < monthRangeArr.length; k++) {
          const refArr = referralArr.filter(
            (item: any) =>
              new Date(item.date).getFullYear() === new Date().getFullYear() &&
              new Date(item.date).toLocaleString("default", {
                month: "short"
              }) === monthRangeArr[k] &&
              new Date(item.date.substring(0, 10).trim()).getFullYear() ===
                new Date().getFullYear() &&
              new Date(item.date.substring(0, 10).trim()).toLocaleString(
                "default",
                {
                  month: "short"
                }
              ) === monthRangeArr[k]
          );
          data1Arr.push(refArr.length);
          const subrefArr = subReferralArr.filter(
            (item: any) =>
              new Date(item.date.substring(0, 10).trim()).getFullYear() ===
                new Date().getFullYear() &&
              new Date(item.date.substring(0, 10).trim()).toLocaleString(
                "default",
                {
                  month: "short"
                }
              ) === monthRangeArr[k] &&
              item.type === "Sub-referral"
          );
          data2Arr.push(subrefArr.length);
        }
        setData1(data1Arr);
        setData2(data2Arr);
      }

      if (analyticsType === AnalyticsType.Yearly) {
        const yearlyRangeArr = yearlyRange(min, max);
        setLabels(yearlyRangeArr);

        for (let k = 0; k < yearlyRangeArr.length; k++) {
          const refArr = referralArr.filter(
            (item: any) =>
              new Date(item.date.substring(0, 10).trim()).getFullYear() ===
              yearlyRangeArr[k]
          );
          data1Arr.push(refArr.length);
          const subrefArr = subReferralArr.filter(
            (item: any) =>
              new Date(item.date.substring(0, 10).trim()).getFullYear() ===
                yearlyRangeArr[k] && item.type === "Sub-referral"
          );
          data2Arr.push(subrefArr.length);
        }
        setData1(data1Arr);
        setData2(data2Arr);
      }
    }
  }, [referralArr, subReferralArr, analyticsType]);

  return (
    <Layout userinfo={props.userinfo}>
      <div className="sub-container">
        <div className="content">
          <div
            className="d-flex align-items-center"
            style={{ marginBottom: 10 }}
          >
            <div>
              <BiCaretLeftCircle
                size={30}
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/dashboard`)}
              />
            </div>
            <h2 className="title m-0">analytics</h2>
          </div>
          {referralArr.length > 0 && (
            <div className="analysis d-lg-flex align-items-center">
              <div
                className="w-100 overflow-auto p-3"
                style={{ maxWidth: 430 }}
              >
                <div className="analytics-type-filter m-2">
                  <div
                    className={filter === "all" ? "active" : ""}
                    onClick={() => setFilter("all")}
                  >
                    All
                  </div>
                  <div
                    className={filter === "ambassadors" ? "active" : ""}
                    onClick={() => setFilter("ambassadors")}
                  >
                    Ambassadors
                  </div>
                  <div
                    className={filter === "referrals" ? "active" : ""}
                    onClick={() => setFilter("referrals")}
                  >
                    Referrals
                  </div>
                </div>
                <div className="analytics-type m-2">
                  <div
                    className={`${
                      analyticsType === AnalyticsType.Daily ? "active" : ""
                    }`}
                    onClick={() => setAnalyticsType(AnalyticsType.Daily)}
                  >
                    {AnalyticsType.Daily}
                  </div>
                  <div
                    className={`${
                      analyticsType === AnalyticsType.Monthly ? "active" : ""
                    }`}
                    onClick={() => setAnalyticsType(AnalyticsType.Monthly)}
                  >
                    {AnalyticsType.Monthly}
                  </div>
                  <div
                    className={`${
                      analyticsType === AnalyticsType.Yearly ? "active" : ""
                    }`}
                    onClick={() => setAnalyticsType(AnalyticsType.Yearly)}
                  >
                    {AnalyticsType.Yearly}
                  </div>
                </div>

                <div className="chart" style={{ width: 370 }}>
                  <Bar
                    options={options}
                    style={{ width: "100%" }}
                    data={{
                      labels,
                      datasets: [
                        {
                          label: "Ambassadors",
                          data:
                            filter === "all" || filter === "ambassadors"
                              ? data1
                              : [],
                          borderColor: "#335c9e",
                          backgroundColor: "#335c9e",
                          stack: "Stack0"
                        },
                        {
                          label: "Referrals",
                          data:
                            filter === "all" || filter === "referrals"
                              ? data2
                              : [],
                          borderColor: "#20c895",
                          backgroundColor: "#20c895",
                          stack: "Stack0"
                        }
                      ]
                    }}
                  />
                </div>
              </div>
              <div className="m-3" style={{ width: "100%" }}>
                <div className="w-100 overflow-auto">
                  <div className="analytics-count">
                    <div>
                      <Image src={ReferralImg} alt="" />
                      <p className="count-title">Ambassadors</p>
                      <h2 className="count-number">{referralCount}</h2>
                    </div>
                    <div>
                      <Image src={ReferralImg} alt="" />
                      <p className="count-title">Referrals</p>
                      <h2 className="count-number">{subReferralCount}</h2>
                    </div>
                    <div>
                      <Image src={PeopleImg} alt="" />
                      <p className="count-title">Total Users</p>
                      <h2 className="count-number">{userCount}</h2>
                    </div>
                    <div>
                      <Image src={ReferralImg} alt="" />
                      <p className="count-title">Metric</p>
                      <h2 className="count-number">{gmailCount}</h2>
                    </div>
                    <div>
                      <Image src={ReferralImg} alt="" />
                      <p className="count-title">Referral Rate</p>
                      <h2 className="count-number">{(subReferralCount / referralCount).toFixed(2)}</h2>
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-center my-2 justify-content-end">
                  <div className="intdiv mt-0 mx-2">
                    <p className="m-0 lable">All</p>
                  </div>
                  <div className="d-flex align-items-center">
                    <Switch
                      onChange={setUnique}
                      checked={unique}
                      className="react-switch"
                      id="normal-switch"
                      checkedIcon={<></>}
                      uncheckedIcon={<></>}
                    />
                  </div>
                  <div className="intdiv mt-0 mx-2">
                    <p className="m-0 lable">Unique</p>
                  </div>
                </div>
                <Tabs
                  activeKey={key}
                  onSelect={(k) => {
                    if (k) setKey(k);
                  }}
                  id="link-tab"
                  className="mb-3"
                >
                  <Tab eventKey="ambassadors" title="Ambassadors">
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
                          Header: "Referral code",
                          accessor: "hashedReferrer"
                        },
                        {
                          Header: "Count",
                          accessor: "count"
                        }
                      ]}
                      data={referralArr}
                      referralData={subReferralArr}
                      setData={(value: any) => setReferralArr(value)}
                    />
                  </Tab>
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
                      data={subReferralArr}
                    />
                  </Tab>
                </Tabs>
              </div>
            </div>
          )}
          {err && <p className="err">{err}</p>}
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

export default Campaigns;
