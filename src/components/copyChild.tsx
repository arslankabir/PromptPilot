import { useState, useEffect } from "react";

function CopyChild(props: any) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  }, [copied]);

  return (
    <div className="position-relative" style={{ cursor: "pointer" }}>
      <div
        onClick={() => {
          navigator.clipboard.writeText(props.value);
          setCopied(true);
        }}
      >
        {props.children}
      </div>

      <div
        className={`copyspan ${copied ? "seen" : "hide"}`}
        style={{ left: -15, color: "#000" }}
      >
        copied
      </div>
    </div>
  );
}

export default CopyChild;
