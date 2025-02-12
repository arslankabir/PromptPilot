import { useState, useEffect } from "react";
import { BsFiles } from "react-icons/bs";

function CopyPanel(props: any) {
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
      <div>{props.title ? props.title : "Campaign URL"}</div>
      <div className="copy-panel">
        <div
          style={{
            width: "calc(100% - 25px)",
            marginRight: 10,
            overflow: "hidden",
            fontFamily: "Poppins-Regular",
          }}
        >
          {props.value}
        </div>
        <div style={{ marginTop: -2, cursor: "pointer", position: "relative" }}>
          <BsFiles
            size={17}
            onClick={() => {
              navigator.clipboard.writeText(props.value);
              setCopied(true);
            }}
          />
          <div className={`copyspan ${copied ? "seen" : "hide"}`}>copied</div>
        </div>
      </div>
    </div>
  );
}

export default CopyPanel;
