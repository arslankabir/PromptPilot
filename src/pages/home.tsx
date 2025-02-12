import { Link, useNavigate } from "react-router-dom";
import ManImg from "../assets/imgs/man.png";
import Img1 from "../assets/imgs/target.png";
import Img2 from "../assets/imgs/Gift.png";
import Img3 from "../assets/imgs/Robot.png";
import ButtonEle from "../components/buttonEle";
import { Image } from "react-bootstrap";
import ReferralImage from "../assets/imgs/referralImage1.png";
import Footbar from "../components/footbar";

function Home(props: any) {
  const handle = () => {
    props.isUserData("click");
  };
  return (
    <>
      <div className="landing-container">
        <div className="landing-header d-md-flex">
          <div className="d-flex align-items-center">
            <div className="logo">AI</div>
            <div className="mx-2">
              <h2 className="m-0 p-0">Reinvent</h2>
            </div>
          </div>
          <div className="my-2">
            <span onClick={() => handle()}>Log in</span>
            {/* <ButtonEle
            title="Book a demo"
            style={{ width: "auto", marginLeft: 30 }}
          /> */}
          </div>
        </div>
        <div className="landing-content">
          <div className="section1 d-md-flex justify-content-between">
            <div>
              <h1>Viral Marketing with AI</h1>
              <p className="mt-4">
                Reward Loyalty. Expand Reach. Let AI Handle the Details.
              </p>
              {/* <ButtonEle title="Book a demo" style={{ width: "auto" }} /> */}
            </div>
            <div>
              <img src={ReferralImage} style={{ width: 500 }} />
            </div>
          </div>
          <div className="section2">
            <h3>Grow your brand with referral marketing.</h3>

            <div
              className="d-md-flex justify-content-between"
              style={{ marginTop: 50 }}
            >
              <div style={{ padding: "0 30px" }}>
                <div style={{ textAlign: "center" }}>
                  <div className="img-div d-flex justify-content-center align-items-center">
                    <Image src={Img1} />
                  </div>
                  <h4>Dynamic Referral System</h4>
                  <p>
                    Transform your followers into brand ambassadors. Our
                    seamless referral system magnifies your reach and impact.
                  </p>
                </div>
              </div>
              <div style={{ padding: "0 30px" }}>
                <div style={{ textAlign: "center" }}>
                  <div className="img-div d-flex justify-content-center align-items-center">
                    <Image src={Img2} />
                  </div>
                  <h4>Tiered Rewards</h4>
                  <p>
                    Engage with tailored rewards, from free content to
                    giveaways. Every referral matters—show your community
                    they're valued.
                  </p>
                </div>
              </div>
              <div style={{ padding: "0 30px" }}>
                <div style={{ textAlign: "center" }}>
                  <div className="img-div d-flex justify-content-center align-items-center">
                    <Image src={Img3} />
                  </div>
                  <h4>AI-Powered Outreach</h4>
                  <p>
                    Say goodbye to generic emails. Our AI personalizes each
                    message, optimizing for engagement and conversion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footbar-home">
        2023 Reinvent, All rights reserved.{" "}
        <Link to="/tos" style={{ color: "#19b799" }}>
          Terms
        </Link>{" "}
        and{" "}
        <Link to="/policy" style={{ color: "#19b799" }}>
          Privacy
        </Link>
      </div>
    </>
  );
}

export default Home;
