import { useState, useEffect } from "react";
import { BsFiles } from "react-icons/bs";

function UpdateCopyPanel(props: any) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  }, [copied]);

  return (
    <div className="copy-box position-relative pt-1">
      <div className="copy-panel m-0 p-0">
        <div
          style={{
            width: "calc(100% - 25px)",
            marginRight: 10,
            overflow: "hidden",
            fontFamily: "Poppins-Regular",
            padding: "12px 18px",
          }}
        >
          {props.value}
        </div>
        <div
          style={{
            cursor: "pointer",
            position: "relative",
            padding: "10px 17px",
            background: "#ec422d",
            display: "flex",
            alignItems: "center",
          }}
          onClick={() => {
            navigator.clipboard.writeText(props.value);
            setCopied(true);
          }}
        >
          <BsFiles size={18} color="#fff" />
          <div className={`copyspan ${copied ? "seen" : "hide"}`}>copied</div>
        </div>
      </div>
    </div>
  );
}

export default UpdateCopyPanel;
