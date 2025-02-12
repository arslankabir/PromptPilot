import { useState } from "react";
import { sendMails } from "../../api/post";
import { BeatLoader } from "react-spinners";
import { BiSave } from "react-icons/bi";
import { Button } from "react-bootstrap";
import { ValidateEmail } from "../../service";
import TextField from "../../components/textField";

function ShareChat(props: any) {
  const [destination, setDestination] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (event: any) => {
    event?.preventDefault();

    setErr("");
    setSuccess("");

    if (!props.userEmail) return;

    const toAddresses: string[] = [];
    const arr = destination.split(",");
    for (let i = 0; i < arr.length; i++) {
      if (ValidateEmail(arr[i].trim())) toAddresses.push(arr[i].trim());
    }

    if (toAddresses.length === 0) {
      setErr("Please insert valid destinations!");
      return;
    }

    setLoading(true);

    const res: any = await sendMails({
      fromAddress: props.userEmail,
      toAddresses,
      subject: "Share Reinvent Conversation",
      content: "Conversations",
      filename: props.filename,
      attachment: props.filecontent,
      type: props.filetype,
    });

    if (res.data) {
      if (res.data.success) {
        setSuccess("Emails are sent successfully");
      } else {
        setErr(res.data.err?.message);
      }
    } else {
      setErr(res.err);
    }
    setLoading(false);
  };
  return (
    <>
      <TextField
        title='Email Addresses to Share (seperated with " , ")'
        required={true}
        value={destination}
        setValue={setDestination}
      />
      {err && <p className="err">{err}</p>}
      {success && <p className="success">{success}</p>}
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <Button className="btn-ele" onClick={handle} style={{ width: 180 }}>
          <BiSave className="mx-1" /> Send
        </Button>
      </div>
      {loading && (
        <div className="loading">
          <BeatLoader color="#f42f3b" size={12} />
        </div>
      )}
    </>
  );
}

export default ShareChat;
