import { useState, useEffect } from "react";
import Layout from "../../components/layout";
import PromptTable from "./promptTable";
import PromptEdit from "./promptEdit";

function Prompt(props: any) {
  const [state, setState] = useState("table");
  const [editPrompt, setEditPrompt] = useState<any>(null);

  return (
    <Layout userinfo={props.userinfo}>
      <div className="sub-container">
        <div className="content">
          {state === "table" ? (
            <PromptTable
              userinfo={props.userinfo}
              setState={setState}
              editPrompt={editPrompt}
              setEditPrompt={setEditPrompt}
            />
          ) : (
            <PromptEdit
              userinfo={props.userinfo}
              setState={setState}
              editPrompt={editPrompt}
              setEditPrompt={setEditPrompt}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Prompt;
