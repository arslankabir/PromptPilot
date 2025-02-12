import { Link } from "react-router-dom";

function Footbar() {
  return (
    <div className="footbar">
      2023 Reinvent, All rights reserved.{" "}
      <Link to="/tos" style={{ color: "#19b799" }}>
        Terms
      </Link>{" "}
      and{" "}
      <Link to="/policy" style={{ color: "#19b799" }}>
        Privacy
      </Link>
    </div>
  );
}

export default Footbar;
