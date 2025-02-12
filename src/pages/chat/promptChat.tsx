import { useState, useEffect, useRef } from "react";
import CloseIcon from "../../assets/imgs/close.png";
import ArrowIcon from "../../assets/imgs/arrow.png";
import { getChatCompletion, saveChatContent } from "../../api/post";
import { BeatLoader } from "react-spinners";
import CopyBtn from "../../components/copyBtn";
import { BsDownload, BsShare } from "react-icons/bs";
import { FaRobot, FaUserTie } from "react-icons/fa";
import { generatePDF } from "../../service";
import PdfContent from "./pdfContent";
import CopyChild from "../../components/copyChild";
import { Modal } from "react-bootstrap";
import ShareChat from "./shareChat";
import { Table } from "react-bootstrap";

interface IChatObj {
  owner: string;
  mention: string;
}

interface IPrompt {
  role: string;
  content: string;
}

function PromptChat(props: any) {
  const messagesEndRef = useRef(null);
  const pdfContentRef = useRef(null);

  const [chatObj, setChatObj] = useState<IChatObj[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState<IPrompt[]>([]);
  const [convStr, setConvStr] = useState("");
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<{ title: string; body: string }[]>([]);

  var index = 0;

  useEffect(() => {
    const getInitAnswer = async (arr: IPrompt[]) => {
      index++;
      setLoading(true);
      const result: any = await getChatCompletion(arr);

      let resTxt = "[]";
      if (result.data) {
        const txt = result?.data?.choices?.[0]?.message?.content.trim();
        if (txt) resTxt = txt;
      }

      let contentArr: any = [];
      const jsonData = JSON.parse(resTxt);
      let str = "";

      if (jsonData) {
        const dataArr = jsonData;

        for (let i = 0; i < dataArr.length; i++) {
          Object.keys(dataArr[i]).forEach((key, index) => {
            str += `${key}\n${dataArr[i][key]}\n`;
            contentArr.push({ title: key, body: dataArr[i][key] });
          });
        }
      }

      setContent(contentArr);
      setConvStr(str);
      setLoading(false);

      // let obj: IChatObj = {
      //   owner: "ai",
      //   mention: resTxt
      // };

      // arr.push({
      //   role: "assistant",
      //   content: resTxt
      // });

      // setChatObj((current) => [...current, obj]);
      // setPrompt(arr);
      // setConvStr(convStr + `AI: ${resTxt}\n`);
    };

    let systemMsgStr = "";
    let promptStr = "";
    if (props.advancedStr === "true") {
      systemMsgStr = props.systemMsg;
      promptStr = props.promptStr;

      for (let i = 0; i < props.questions.length; i++) {
        systemMsgStr = systemMsgStr.replace(
          `{Q${i + 1}}`,
          props.questions[i] ? props.questions[i] : ""
        );
        promptStr = promptStr.replace(
          `{Q${i + 1}}`,
          props.questions[i] ? props.questions[i] : ""
        );
        systemMsgStr = systemMsgStr.replace(
          `{A${i + 1}}`,
          props.answers[i] ? props.answers[i] : ""
        );
        promptStr = promptStr.replace(
          `{A${i + 1}}`,
          props.answers[i] ? props.answers[i] : ""
        );
      }
    } else {
      let formatArr: any = [];
      let titleArr = [];
      let paraStr = "";

      let reports = props.reports;
      let basicQA = props.basicQA;

      for (let i = 0; i < basicQA.length; i++) {
        for (let k = 0; k < props.questions.length; k++) {
          basicQA[i].answer = basicQA[i].answer.replace(
            `{Q${k + 1}}`,
            props.questions[k] ? props.questions[k] : ""
          );
          basicQA[i].answer = basicQA[i].answer.replace(
            `{A${k + 1}}`,
            props.answers[k] ? props.answers[k] : ""
          );
        }
      }

      for (let i = 0; i < reports.length; i++) {
        for (let k = 0; k < props.questions.length; k++) {
          reports[i].t = reports[i].t.replace(
            `{Q${k + 1}}`,
            props.questions[k] ? props.questions[k] : ""
          );
          reports[i].t = reports[i].t.replace(
            `{A${k + 1}}`,
            props.answers[k] ? props.answers[k] : ""
          );
          reports[i].p = reports[i].p.replace(
            `{Q${k + 1}}`,
            props.questions[k] ? props.questions[k] : ""
          );
          reports[i].p = reports[i].p.replace(
            `{A${k + 1}}`,
            props.answers[k] ? props.answers[k] : ""
          );
        }

        formatArr.push(`{"${reports[i].t}":"paragraph-${i + 1}"}`);
        titleArr.push(`${reports[i].t}`);
        paraStr += ` For the "${reports[i].t}" section, write paragraph-${
          i + 1
        } based on this prompt: "${reports[i].p}"`;
      }

      systemMsgStr = `You are a friendly and clever AI bot who helps coaches generate PDF reports. Each report contains >=1 sections, and each section contains a title and paragraph.

        Return your PDF in this format:
        [${formatArr.toString()}]`;

      promptStr = `Please create a PDF report. This is the purpose of the report: "${
        basicQA[0] ? basicQA[0].answer : ""
      }". The PDF report must have the following section titles: [${titleArr.toString()}].${paraStr}.

        Return a one page PDF in this format:
        [${formatArr.toString()}]`;
    }

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

    if (index === 0 && systemMsgStr && promptStr && props.advancedStr)
      getInitAnswer(promptArr);
  }, [props.advancedStr]);

  useEffect(() => {
    const getAnswer = async () => {
      if (prompt) {
        setLoading(true);
        let arr = [...prompt];
        arr.push({
          role: "user",
          content: `${chatObj[chatObj.length - 1].mention}`
        });
        const result: any = await getChatCompletion(arr);

        let resTxt = "[]";
        if (result.data) {
          const txt = result?.data?.choices?.[0]?.message?.content.trim();
          if (txt) resTxt = txt;
        }

        let obj: IChatObj = {
          owner: "ai",
          mention: resTxt
        };

        setChatObj((current) => [...current, obj]);
        arr.push({
          role: "assistant",
          content: resTxt
        });
        setPrompt(arr);
        setLoading(false);
        setConvStr(convStr + `AI: ${resTxt}\n`);
      }
    };

    if (chatObj.length > 0 && !props.demo) {
      saveChatContent({
        email: props.userEmail,
        data: chatObj[chatObj.length - 1],
        prompt: props.promptId,
        answers: props.answers
      });
    }

    if (chatObj.length > 0 && chatObj[chatObj.length - 1].owner === "you")
      getAnswer();

    // @ts-ignore
    // messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [JSON.stringify(chatObj)]);

  // useEffect(() => {
  //   // @ts-ignore
  //   if (loading) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  // }, [loading]);

  // const enterChat = (e: any) => {
  //   if (e.key === "Enter") {
  //     sendMsg();
  //   }
  // };

  // const sendMsg = () => {
  //   if (!query) return;

  //   let obj = { owner: "you", mention: query };
  //   setChatObj((current) => [...current, obj]);
  //   setQuery("");
  //   setConvStr(convStr + `YOU: ${query}\n`);
  // };

  const exportPdf = () => {
    try {
      generatePDF({
        data: pdfContentRef.current,
        fileName: "Reinvent.pdf"
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="d-none">
        <div ref={pdfContentRef}>
          <PdfContent data={content} />
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-zone">
          <div className="d-flex justify-content-between align-items-center">
            {/*<div>
              <h2 className="title">GPT chat</h2>
            </div>*/}
            <div>
              <h2 className="title"></h2>
            </div>
            <div className="cancel">
              <div>
                <BsShare size={16} onClick={() => setOpen(true)} />
              </div>
              <div className="mx-3">
                <BsDownload size={18} onClick={() => exportPdf()} />
              </div>
              <div style={{ position: "relative", top: "-2px" }}>
                <CopyBtn size={16} value={convStr} />
              </div>
              {props.init && (
                <img
                  style={{ marginLeft: 20, position: "relative", top: 1 }}
                  src={CloseIcon}
                  alt="close"
                  width={20}
                  onClick={() => props.init()}
                />
              )}
            </div>
          </div>
          {loading && (
            <div className="p-2">
              <BeatLoader color="red" size={9} />
            </div>
          )}
          <Table>
            <tbody>
              {content.length > 0 &&
                content.map(
                  (item: { title: string; body: string }, index: number) => (
                    <tr key={index}>
                      <td
                        style={{
                          verticalAlign: "top",
                          paddingRight: "10px"
                        }}
                      >
                        <h5 style={{ fontWeight: "bold" }}>{item.title}</h5>
                        <p style={{ fontSize: 18 }}>{item.body}</p>
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </Table>
          {/*
          <div className="py-2" style={{ borderTop: "1px solid #dae8ff" }}>
            <div className="chat-content">
              {chatObj.map((cht: IChatObj, index: number) => (
                <div
                  className={`chat-item ${
                    cht.owner === "you" ? "ymsg" : "cmsg"
                  }`}
                  key={index}
                >
                  <div
                    style={{
                      marginTop: 6,
                      padding: "7px 11px",
                      borderRadius: 3,
                      background: cht.owner === "you" ? "#ec422d" : "#529576",
                    }}
                  >
                    {cht.owner === "you" ? (
                      <FaUserTie size={15} color="#fff" />
                    ) : (
                      <FaRobot size={15} color="#fff" />
                    )}
                  </div>
                  <div className="mentioned">
                    <CopyChild value={cht.mention}>{cht.mention}</CopyChild>
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ marginBottom: "10px" }}>
                  <BeatLoader color="red" size={9} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <div className="chat-input">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyUp={(e) => enterChat(e)}
              disabled={loading}
            />
            <div className="d-flex align-items-center">
              <img src={ArrowIcon} alt="arrow" onClick={sendMsg} />
            </div>
          </div>
              */}
        </div>
      </div>
      <Modal show={open} onHide={() => setOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Share the conversation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ShareChat
            userEmail={props.userEmail}
            filename="Reinvent.pdf"
            filetype="application/pdf"
            filecontent={convStr}
          />
        </Modal.Body>
      </Modal>
    </>
  );
}

export default PromptChat;
