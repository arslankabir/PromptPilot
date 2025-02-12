import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getPromptById } from "../../api/post";
import PromptSurvey from "./promptSurvey";
import PromptChat from "./promptChat";
import { isJsonString } from "../../service";

function Chat() {
  const [state, setState] = useState("survey");
  const [questions, setQuestions] = useState<string[]>([]);
  const [advanced, setAdvanced] = useState(false);
  const [advancedStr, setAdvancedStr] = useState("");
  const [answers, setAnswers] = useState([]);
  const [systemMsg, setSystemMsg] = useState("");
  const [promptStr, setPromptStr] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [basicQA, setBasicQA] = useState<
    { label: string; question: string; answer: string }[]
  >([]);
  const [basicSections, setBasicSections] = useState<
    { t: string; p: string }[]
  >([]);
  const [reports, setReports] = useState<{ t: string; p: string }[]>([]);

  const params = useParams();

  var index = 0;

  useEffect(() => {
    const getPrompt = async () => {
      index++;
      const res = await getPromptById({ id: params.id });
      if (res.data) {
        setQuestions(
          res.data.Item.questions.S ? JSON.parse(res.data.Item.questions.S) : []
        );
        setSystemMsg(res.data.Item.systemMsg.S);
        setPromptStr(res.data.Item.prompt.S);
        setAdvanced(
          res.data.Item.advanced.S && res.data.Item.advanced.S === "true"
        );
        setAdvancedStr(res.data.Item.advanced.S);
        setBasicQA(JSON.parse(res.data.Item.basicQA.S));
        setBasicSections(JSON.parse(res.data.Item.basicSections.S));
        setReports(
          res.data.Item.report &&
            res.data.Item.report.S &&
            isJsonString(res.data.Item.report.S)
            ? JSON.parse(res.data.Item.report.S)
            : []
        );
      }
    };

    if (index === 0 && params.id) {
      getPrompt();
    }
  }, [params.id]);

  const init = () => {
    setAnswers([]);
    setState("survey");
  };

  return (
    <div className="layout top-border" style={{ minHeight: "100vh" }}>
      <div className="sub-container px-2">
        {state === "survey" ? (
          <div className="content">
            <PromptSurvey
              setState={setState}
              questions={questions}
              answers={answers}
              setAnswers={setAnswers}
              userEmail={userEmail}
              setUserEmail={setUserEmail}
              promptId={params.id}
            />
          </div>
        ) : (
          <div
            className="m-auto p-2"
            style={{
              maxWidth: "1020px",
              border: "1px solid #58ceed",
              borderRadius: 8,
              backgroundColor: "rgba(255, 255, 255, 0.5)"
            }}
          >
            <PromptChat
              init={init}
              systemMsg={systemMsg}
              questions={questions}
              answers={answers}
              promptStr={promptStr}
              userEmail={userEmail}
              advancedStr={advancedStr}
              promptId={params.id}
              basicQA={basicQA}
              basicSections={basicSections}
              reports={reports}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
