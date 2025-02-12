import { useState, useEffect } from "react";
import { BsFiles } from "react-icons/bs";
import { Button } from "react-bootstrap";

function CopyBtn(props: any) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  }, [copied]);

  return (
    <div className="position-relative pt-1">
      {props.btn ? (
        <Button
          className="btn-ele small"
          onClick={() => {
            navigator.clipboard.writeText(props.value);
            setCopied(true);
          }}
          style={{ minWidth: 90, width: "fit-content" }}
        >
          {props.text ? props.text : "Copy"}
        </Button>
      ) : (
        <div
          className="copy-btn"
          onClick={() => {
            navigator.clipboard.writeText(props.value);
            setCopied(true);
          }}
        >
          <div>
            <BsFiles size={props.size ? props.size : 15} />
          </div>
          {/*
          <div className="copy-title">
            <span>Copy&nbsp;Link</span>
          </div>
          */}
        </div>
      )}

      <div className={`copyspan ${copied ? "seen" : "hide"}`}>copied</div>
    </div>
  );
}

export default CopyBtn;
