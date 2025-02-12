import Layout from "../components/layout";

function AboutUs(props: any) {
  return (
    <Layout userinfo={props.userinfo}>
      <div className="sub-container">
        <div className="content">
          <h2 className="title" style={{ marginBottom: 50 }}>
            about us
          </h2>
        </div>
      </div>
    </Layout>
  );
}

export default AboutUs;
