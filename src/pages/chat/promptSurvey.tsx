import { useState, useEffect } from "react";
import ButtonEle from "../../components/buttonEle";
import TextAreaField from "../../components/textAreaField";
import TextField from "../../components/textField";
import { ValidateEmail } from "../../service";

function PromptSurvey(props: any) {
  const [ans, setAns] = useState<string>("");
  const [step, setStep] = useState(0);

  const handle = () => {
    if (step === 100) {
      if (props.userEmail && ValidateEmail(props.userEmail)) {
        localStorage.setItem("gtpsurveyEmail", props.userEmail);
        setStep(0);
      }
    } else {
      if (props.questions.length === 0) return;

      if (ans) {
        props.setAnswers((current: any) => [...current, ans]);
        setStep(step + 1);
        setAns("");
      }
    }
  };

  useEffect(() => {
    if (props.answers.length === 0) return;

    if (props.answers.length === props.questions.length) props.setState("chat");
  }, [props.answers]);

  useEffect(() => {
    const userEmail = localStorage.getItem("gtpsurveyEmail");
    if (userEmail) {
      props.setUserEmail(userEmail);
    } else {
      setStep(100);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("gtpsurveyEmail");
    props.setUserEmail("");
    setStep(100);
  };

  return (
    <div style={{ maxWidth: "650px", margin: "auto" }}>
      {step < 100 && (
        <div className="d-flex justify-content-end">
          <div
            style={{
              fontFamily: "Muli-SemiBold",
              color: "#23d092",
              textDecoration: "underline",
              cursor: "pointer",
            }}
            onClick={() => logout()}
          >
            sign out
          </div>
        </div>
      )}
      <div style={{ margin: "50px 20px", textAlign: "center" }}>
        <h2 className="title">
          {step === 100 ? (
            <>Please insert your email</>
          ) : props.questions && props.questions.length > 0 ? (
            props.questions[step]
          ) : (
            ""
          )}
        </h2>
      </div>

      <div className="mt-2" style={{ textAlign: "center" }}>
        {step === 100 ? (
          <TextField
            title=""
            value={props.userEmail}
            setValue={props.setUserEmail}
          />
        ) : (
          <TextAreaField title="" rows={4} value={ans} setValue={setAns} />
        )}
      </div>
      <div
        className="mt-3"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <ButtonEle title="Continue" handle={handle} />
      </div>
    </div>
  );
}

export default PromptSurvey;
