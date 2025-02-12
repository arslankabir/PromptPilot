import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/layout";
import SaveTag from "../components/saveTag";
import { BiCaretLeftCircle } from "react-icons/bi";

function Tags(props: any) {
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
            <h2 className="title m-0">Tags</h2>
          </div>
          <SaveTag campaignHashedReferrer={params.url} />
        </div>
      </div>
    </Layout>
  );
}

export default Tags;
