import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/layout";
import SaveReward from "../components/saveReward";
import { BiCaretLeftCircle } from "react-icons/bi";

function Rewards(props: any) {
  const params = useParams();
  const navigate = useNavigate();

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
            <h2 className="title m-0">rewards</h2>
          </div>
          <SaveReward campaignHashedReferrer={params.url} />
        </div>
      </div>
    </Layout>
  );
}

export default Rewards;
