import { useState, useEffect } from "react";
import ButtonEle from "../../components/buttonEle";
import { Table, Pagination, Button, Modal } from "react-bootstrap";
import CopyBtn from "../../components/copyBtn";
import { getPrompts, deletePrompt } from "../../api/post";
import { BsCodeSlash, BsX } from "react-icons/bs";
import { BeatLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { BiEdit } from "react-icons/bi";
import Confirm from "../../components/confirmation";

function PromptTable(props: any) {
  const [prompts, setPrompts] = useState([]);
  const [showPrompts, setShowPrompts] = useState([]);
  const [err, setErr] = useState("");

  const [snippetCode, setSnippetCode] = useState("");

  const [step, setStep] = useState<number>(10);
  const [offset, setOffset] = useState(0);
  const [pages, setPages] = useState(0);
  const [current, setCurrent] = useState(1);
  const [loading, setLoading] = useState(false);

  const [editData, setEditData] = useState<any>({});

  const [embedShow, setEmbedShow] = useState(false);
  const toggleEmbedShow = () => setEmbedShow(!embedShow);

  const navigate = useNavigate();

  const handle = (state: string, prompt: any) => {
    props.setEditPrompt(prompt);
    props.setState(state);
  };

  var index = 0;

  const getAllPrompts = async () => {
    index++;
    setLoading(true);
    const res = await getPrompts({ email: props.userinfo.email, type: "v1" });
    if (res.data) {
      if (res.data.data.length > 0) {
        setPrompts(res.data.data);
      } else {
        setPrompts([]);
        setErr("No data");
      }
    } else {
      setErr(res.err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (index === 0 && props.userinfo.email) getAllPrompts();
  }, [JSON.stringify(props.userinfo)]);

  useEffect(() => {
    if (prompts.length > 0) {
      setShowPrompts(prompts.slice(offset, offset + step));
      setPages(Math.ceil(prompts.length / step));
    }
  }, [prompts.length, step, offset]);

  useEffect(() => {
    setOffset((current - 1) * step);
  }, [current]);

  useEffect(() => {
    if (showPrompts.length === 0 && current > 1) {
      setCurrent(1);
    }
  }, [showPrompts]);

  const paginate = (param: string) => {
    if (param === "next") {
      if (current < pages) setCurrent(current + 1);
    } else if (param === "prev") {
      if (current > 1) setCurrent(current - 1);
    } else {
      setCurrent(parseInt(param));
    }
  };

  const deleteItem = async (id: string) => {
    if (await Confirm("Are you sure you want to delete?")) {
      setLoading(true);
      const res = await deletePrompt({ id });
      if (res.data) {
        if (res.data.success) {
          getAllPrompts();
        } else {
          setErr(res.err);
        }
      } else {
        setErr(res.err);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    if (props.editPrompt) {
      const editObj = {
        questions: JSON.parse(props.editPrompt.questions),
        systemMsg: props.editPrompt.systemMsg,
        promptsStr: props.editPrompt.prompt,
        promptId: props.editPrompt.id,
        advancedStr: props.editPrompt.advanced,
        basicQAArr: JSON.parse(props.editPrompt.basicQA),
        basicSectionsArr: JSON.parse(props.editPrompt.basicSections)
      };
      setEditData(editObj);

      let str = `<form id="sform" onsubmit="event.preventDefault(); onSubmit();">
                  <input type="hidden" id="prompt_id" value="${props.editPrompt.id}" name="id" />`;
      for (let i = 0; i < JSON.parse(props.editPrompt.questions).length; i++) {
        str += `
              <div class="survey_item">
                <p>${JSON.parse(props.editPrompt.questions)[i]}</p>
                <input type="text" class="answers" required />
              </div>
            `;
      }

      str += `<button type="submit" style="margin-top: 20px">Submit</button>
          </form>
          <script>
            function onSubmit() {
              const answers = getAnswers();
              const questions = ${props.editPrompt.questions};
              const messages = getMessage(questions, answers);

              fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': 'Bearer ${process.env.REACT_APP_OPENAI_API_KEY || ''}',
                  'Accept': 'application/json, text/plain, */*',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({model: 'gpt-3.5-turbo', messages: messages})
              }).then(res => res.json())
                .then(res => console.log(res));
            }
            document.getElementById("sform").addEventListener('keypress', function(e) {
              if (e.keyCode === 13) {
                e.preventDefault();
              }
            });

            function getAnswers() {
              let arr = [];
              const ansEls = document.getElementsByClassName("answers");
              for (var i = 0; i < ansEls.length; i++) {
                arr.push(ansEls[i].value)
              }
              return arr;
            }

            function getMessage(questions, answers) {
              ${returnPrompt(editObj)}
            }
          </script>`;
      setSnippetCode(str);
    }
  }, [JSON.stringify(props.editPrompt)]);

  const returnPrompt = (data: any) => {
    let str = `let systemMsgStr = "", promptStr = "";`;
    if (data.advancedStr === "true") {
      str +=
        `
        systemMsgStr = '${data.systemMsg}';
        promptStr = '${data.promptsStr}';

        for (let i = 0; i < questions.length; i++) {
          systemMsgStr = systemMsgStr.replace(
            ` +
        "{Q${i + 1}} " +
        `,
          data.questions[i] ? data.questions[i] : ""
          );

          promptStr = promptStr.replace(
            ` +
        "{Q${i + 1}} " +
        `,
        data.questions[i] ? data.questions[i] : ""
          );

          systemMsgStr = systemMsgStr.replace(
            ` +
        "{A${i + 1}} " +
        `,
        data.answers[i] ? data.answers[i] : ""
          );

          promptStr = promptStr.replace(
            ` +
        "{A${i + 1}} " +
        `,
        data.answers[i] ? data.answers[i] : ""
          );
        }
      `;
    } else {
      str +=
        `
        let formatArr = [];
        let titleArr = [];
        let paraStr = "";
        let basicSections = ${JSON.stringify(data.basicSectionsArr)};
        let basicQA = ${JSON.stringify(data.basicQAArr)};

        for (let i = 0; i < basicQA.length; i++) {
          for (let k = 0; k < questions.length; k++) {
            basicQA[i].answer = basicQA[i].answer.replace(
              ` +
        "`{Q${k + 1}}`" +
        `,
        data.questions[k] ? data.questions[k] : ""
            );
            basicQA[i].answer = basicQA[i].answer.replace(
              ` +
        "`{A${k + 1}}`" +
        `,
        data.answers[k] ? data.answers[k] : ""
            );
          }
        }

        for (let i = 0; i < basicSections.length; i++) {
          for (let k = 0; k < questions.length; k++) {
            basicSections[i].t = basicSections[i].t.replace(
              ` +
        "`{Q${k + 1}}`" +
        `,
        data.questions[k] ? data.questions[k] : ""
            );
            basicSections[i].t = basicSections[i].t.replace(
              ` +
        "`{A${k + 1}}`" +
        `,
        data.answers[k] ? data.answers[k] : ""
            );
            basicSections[i].p = basicSections[i].p.replace(
              ` +
        "`{Q${k + 1}}`" +
        `,
        data.questions[k] ? data.questions[k] : ""
            );
            basicSections[i].p = basicSections[i].p.replace(
              ` +
        "`{A${k + 1}}`" +
        `,
        data.answers[k] ? data.answers[k] : ""
            );
          }

          formatArr.push(` +
        '`{"${basicSections[i].t}":"paragraph-${i + 1}"}`' +
        `);

        titleArr.push(basicSections[i].t);
        paraStr += ' For the "` +
        "' + basicSections[i].t +'" +
        `" section, write paragraph-` +
        "'+ (i + 1) +'" +
        ` based on this prompt: "` +
        "' + basicSections[i].p +'" +
        `"';
        }

        systemMsgStr = 'You are a friendly and clever AI bot who helps coaches generate PDF reports. Each report contains >=1 sections, and each section contains a title and paragraph. Return your PDF in this format: [` +
        "' + formatArr.toString() + '" +
        `]';

        promptStr = 'Please create a PDF report. This is the purpose of the report: "` +
        "' + basicQA[0] ? basicQA[0].answer : \"\" +'" +
        `". The PDF report must have the following section titles: [` +
        "'+ titleArr.toString() +'" +
        `].` +
        "' + paraStr +'" +
        `. Return a one page PDF in this format: [` +
        "' + formatArr.toString() +'" +
        `]';
      `;
    }

    str += `
      let promptArr = [
        {
          role: "system",
          content: systemMsgStr
        },
        {
          role: "user",
          content: promptStr
        }
      ];

      return promptArr;
    `;

    return str;
  };

  return (
    <>
      <div
        className="d-md-flex justify-content-between"
        style={{ marginBottom: 20 }}
      >
        <h2 className="title">prompts</h2>
        <ButtonEle
          title="+ create prompt"
          handle={() => handle("edit", null)}
        />
      </div>
      {prompts.length > 0 && (
        <div>
          <Table responsive className="campaign-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Prompt</th>
                <th>Link</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {showPrompts.map((item: any, index: number) => (
                <tr key={index} className="data-row">
                  <td>{item.name}</td>
                  <td style={{ textAlign: "left" }}>
                    {item.advanced === "true" ? item.prompt : item.basicPrompt}
                  </td>
                  <td>
                    <div className="d-flex align-items-center justify-content-center">
                      <div>{`${window.location.origin}/survey/${item.id}`}</div>
                      <div
                        className="mx-2"
                        style={{ position: "relative", top: "-2px" }}
                      >
                        <CopyBtn
                          value={`${window.location.origin}/survey/${item.id}`}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex justify-content-center">
                      {/*
                      <div
                        className="analytics"
                        onClick={() => navigate(`/chats/${item.id}`)}
                        style={{ marginRight: 20 }}
                      >
                        <svg
                          width="19"
                          height="19"
                          viewBox="0 0 19 19"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3.5 1.83331H2V16.8333H17V15.3333H3.5V1.83331Z"
                            fill="#5D6676"
                          />
                          <path
                            d="M14.75 3.33329C14.1533 3.33329 13.581 3.57034 13.159 3.9923C12.7371 4.41425 12.5 4.98655 12.5 5.58329C12.5029 6.09081 12.6774 6.58242 12.995 6.97829L11.495 9.39329C11.0803 9.29874 10.6468 9.33008 10.25 9.48329L9.2075 8.22329C9.40442 7.87597 9.50537 7.48251 9.5 7.08329C9.5 6.63828 9.36804 6.20326 9.12081 5.83325C8.87357 5.46324 8.52217 5.17485 8.11104 5.00456C7.6999 4.83426 7.2475 4.7897 6.81105 4.87652C6.37459 4.96334 5.97368 5.17763 5.65901 5.4923C5.34434 5.80696 5.13005 6.20788 5.04323 6.64433C4.95642 7.08079 5.00097 7.53319 5.17127 7.94432C5.34157 8.35546 5.62996 8.70686 5.99997 8.95409C6.36998 9.20133 6.80499 9.33329 7.25 9.33329C7.50673 9.32646 7.76039 9.27572 8 9.18329L9.0425 10.4433C8.84558 10.7906 8.74463 11.1841 8.75 11.5833C8.75 12.18 8.98705 12.7523 9.40901 13.1743C9.83097 13.5962 10.4033 13.8333 11 13.8333C11.5967 13.8333 12.169 13.5962 12.591 13.1743C13.0129 12.7523 13.25 12.18 13.25 11.5833C13.2471 11.0758 13.0726 10.5841 12.755 10.1883L14.255 7.77329C14.5648 7.84624 14.8865 7.85264 15.199 7.79207C15.5114 7.73149 15.8074 7.60533 16.0675 7.42191C16.3276 7.23848 16.5458 7.00197 16.7077 6.72799C16.8697 6.454 16.9716 6.14879 17.0069 5.83249C17.0421 5.51619 17.0099 5.19602 16.9123 4.8931C16.8147 4.59018 16.6539 4.31142 16.4406 4.07522C16.2273 3.83902 15.9663 3.65075 15.6749 3.52286C15.3835 3.39497 15.0682 3.33035 14.75 3.33329ZM6.5 7.08329C6.5 6.93495 6.54399 6.78995 6.6264 6.66661C6.70881 6.54327 6.82594 6.44714 6.96299 6.39038C7.10003 6.33361 7.25083 6.31876 7.39632 6.3477C7.5418 6.37664 7.67544 6.44807 7.78033 6.55296C7.88522 6.65785 7.95665 6.79148 7.98559 6.93697C8.01453 7.08245 7.99968 7.23325 7.94291 7.3703C7.88614 7.50734 7.79002 7.62448 7.66668 7.70689C7.54334 7.7893 7.39834 7.83329 7.25 7.83329C7.05109 7.83329 6.86032 7.75427 6.71967 7.61362C6.57902 7.47296 6.5 7.2822 6.5 7.08329ZM11 12.3333C10.8517 12.3333 10.7067 12.2893 10.5833 12.2069C10.46 12.1245 10.3639 12.0073 10.3071 11.8703C10.2503 11.7333 10.2355 11.5825 10.2644 11.437C10.2934 11.2915 10.3648 11.1578 10.4697 11.053C10.5746 10.9481 10.7082 10.8766 10.8537 10.8477C10.9992 10.8188 11.15 10.8336 11.287 10.8904C11.4241 10.9471 11.5412 11.0433 11.6236 11.1666C11.706 11.2899 11.75 11.4349 11.75 11.5833C11.75 11.7822 11.671 11.973 11.5303 12.1136C11.3897 12.2543 11.1989 12.3333 11 12.3333ZM14.75 6.33329C14.6017 6.33329 14.4567 6.2893 14.3333 6.20689C14.21 6.12448 14.1139 6.00734 14.0571 5.8703C14.0003 5.73325 13.9855 5.58245 14.0144 5.43697C14.0434 5.29148 14.1148 5.15785 14.2197 5.05296C14.3246 4.94807 14.4582 4.87664 14.6037 4.8477C14.7492 4.81876 14.9 4.83361 15.037 4.89038C15.1741 4.94714 15.2912 5.04327 15.3736 5.16661C15.456 5.28995 15.5 5.43495 15.5 5.58329C15.5 5.7822 15.421 5.97296 15.2803 6.11362C15.1397 6.25427 14.9489 6.33329 14.75 6.33329Z"
                            fill="#5D6676"
                          />
                        </svg>
                      </div>
                      */}
                      <div
                        className="analytics pt-1"
                        onClick={() => handle("edit", item)}
                      >
                        <BiEdit size={20} />
                      </div>
                      <div
                        className="analytics pt-1"
                        style={{ marginLeft: 20 }}
                        onClick={() => {
                          toggleEmbedShow();
                          props.setEditPrompt(item);
                        }}
                      >
                        <div>
                          <BsCodeSlash size={20} />
                        </div>
                      </div>
                      <div
                        className="analytics delete-icon pt-1"
                        onClick={() => {
                          deleteItem(item.id);
                        }}
                        style={{ marginLeft: 20 }}
                      >
                        <BsX size={25} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="display d-lg-flex">
            <div className="d-flex align-items-center my-2">
              <div>
                Displaying <span className="colored">{showPrompts.length}</span>{" "}
                out of <span className="colored">{prompts.length}</span> |
                Displaying Per Row
              </div>
              <div>
                <select
                  value={step}
                  onChange={(e) => setStep(parseInt(e.target.value))}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                </select>
              </div>
            </div>
            <div className="my-2" style={{ width: "max-content" }}>
              <Pagination>
                <Pagination.Item onClick={() => paginate("prev")}>
                  {"<"}
                </Pagination.Item>
                {Array(pages)
                  .fill(1)
                  .map((items: any, index: number) => (
                    <Pagination.Item
                      key={index}
                      active={current === index + 1}
                      onClick={() => paginate((index + 1).toString())}
                    >
                      {index + 1}
                    </Pagination.Item>
                  ))}
                <Pagination.Item onClick={() => paginate("next")}>
                  {">"}
                </Pagination.Item>
              </Pagination>
            </div>
          </div>
        </div>
      )}
      {err && <p className="err p-3">{err}</p>}
      {loading && (
        <div className="loading">
          <BeatLoader color="#f42f3b" size={12} />
        </div>
      )}
      <Modal show={embedShow} onHide={toggleEmbedShow}>
        <Modal.Header closeButton>
          <Modal.Title>Embed&nbsp;Script</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="embed-script">
            {`<!-- Embed Script Start -->`}
            <br />
            {`<form id="sform" onsubmit="event.preventDefault(); onSubmit();">`}
            <br />
            &nbsp;
            {`<input type="hidden" id="prompt_id" value=${
              editData.promptId ? editData.promptId : ""
            } name="id" />`}
            <br />
            {editData.questions &&
              editData.questions.map((item: string, index: number) => (
                <div key={index}>
                  {`<div class="survey_item">`}
                  <br />
                  &nbsp;
                  {`<p>${item}</p>`}
                  <br />
                  &nbsp;
                  {`<input type="text" required />`}
                  <br />
                  {`</div>`}
                  <br />
                </div>
              ))}
            {`<button type="submit" style="margin-top: 20px">Submit</button>`}
            <br />
            {`</form>`}
            <br />
            {`<script>`}
            <br />
            &nbsp;
            {`function onSubmit() {`}
            <br />
            &nbsp;&nbsp;
            {`const answers = getAnswers();`}
            <br />
            &nbsp;&nbsp;
            {`const questions = ${JSON.stringify(editData.questions)};`}
            <br />
            &nbsp;&nbsp;
            {`const messages = getMessage(questions, answers);`}
            <br />
            &nbsp;&nbsp;
            {`fetch('https://api.openai.com/v1/chat/completions', {`}
            &nbsp;&nbsp;&nbsp;&nbsp;
            <br />
            {`method: 'POST',`}
            &nbsp;&nbsp;&nbsp;&nbsp;
            <br />
            {`headers: {`}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <br />
            {`'Authorization': 'Bearer ${process.env.REACT_APP_OPENAI_API_KEY || ''}',`}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <br />
            {`'Accept': 'application/json, text/plain, */*',`}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <br />
            {`'Content-Type': 'application/json'`}
            &nbsp;&nbsp;&nbsp;&nbsp;
            <br />
            {`},`}
            &nbsp;&nbsp;&nbsp;&nbsp;
            <br />
            {`body: JSON.stringify({model: 'gpt-3.5-turbo', messages: messages})`}
            &nbsp;&nbsp;
            <br />
            {`}).then(res => res.json())`}
            &nbsp;&nbsp;
            <br />
            {`.then(res => console.log(res));`}
            <br />
            {`}`}
            <br />
            <br />
            {`function getAnswers() {`}
            <br />
            &nbsp;&nbsp;
            {`let arr = [];`}
            <br />
            &nbsp;&nbsp;
            {`const ansEls = document.getElementsByClassName("answers");`}
            <br />
            &nbsp;&nbsp;
            {`for (var i = 0; i < ansEls.length; i++) {`}
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;
            {`arr.push(ansEls[i].value);`}
            <br />
            &nbsp;&nbsp;
            {`}`}
            <br />
            &nbsp;&nbsp;
            {`return arr;`}
            <br />
            {`}`}
            <br />
            <br />
            {`function getMessage(questions, answers) {`}
            <br />
            &nbsp;&nbsp;
            {`${returnPrompt(editData)}`}
            <br />
            {`}`}
            <br />
            {`</script>`}
          </div>
          <div style={{ height: 100 }}>
            <div
              className="copy-button"
              style={{
                marginTop: 20,
                float: "right",
                width: 100
              }}
            >
              <CopyBtn value={snippetCode} btn={true} />
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default PromptTable;
