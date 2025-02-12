//@ts-nocheck

import { useState, useEffect, useRef } from "react";
import {
  Modal,
  Button,
  Popover,
  OverlayTrigger,
  FormSelect,
  Table
} from "react-bootstrap";
import Reorder from "react-reorder";
import move from "lodash-move";
import {
  BsX,
  BsExclamationCircle,
  BsQuestionCircle,
  BsPencilFill,
  BsCheckLg,
  BsDownload,
  BsShare,
  BsPlusCircle
} from "react-icons/bs";
import { savePrompt, getChatCompletion } from "../../api/post";
import { BeatLoader } from "react-spinners";
import { BiCaretLeftCircle } from "react-icons/bi";
import {
  randomStringRef,
  basicQuestions,
  generatePDF,
  isJsonString
} from "../../service";
import CopyBtn from "../../components/copyBtn";
import MultiStepProgressBar from "./stepProgressBar";
import PdfContent from "../chat/pdfContent";
import ShareChat from "../chat/shareChat";
import ButtonEle from "../../components/buttonEle";
import AccordianDiv from "../../components/accordianDiv";

function PromptEdit(props: any) {
  const pdfContentRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [openQuestion, setOpenQuestion] = useState(false);
  const [convStr, setConvStr] = useState("");
  const [content, setContent] = useState<{ title: string; body: string }[]>([]);

  const [questions, setQuestions] = useState<string[]>([]);
  const [demoAnswers, setDemoAnswers] = useState<string[]>([]);
  const [demoA, setDemoA] = useState("");
  const [q, setQ] = useState("");
  const [qEdit, setQEdit] = useState<boolean[]>([]);
  const [promptName, setPromptName] = useState("");
  const [promptDescription, setPromptDescription] = useState("");
  const [systemMsg, setSystemMsg] = useState("");
  const [promptStr, setPromptStr] = useState("");
  const [systemMsgJosh, setSystemMsgJosh] = useState("");
  const [promptStrJosh, setPromptStrJosh] = useState("");
  const [promptType, setPromptType] = useState("josh");
  const [basicQA, setBasicQA] = useState<
    { label: string; question: string; answer: string }[]
  >([]);

  const [openSection, setOpenSection] = useState(false);
  const [section, setSection] = useState<{ t: string; p: string }>({
    t: "",
    p: ""
  });
  const [sEdit, setSEdit] = useState<boolean[]>([]);

  const [copyLink, setCopyLink] = useState("");
  const [o1StrEditable, setO1StrEditable] = useState(false);
  const [updateSectionsEditable, setUpdateSectionsEditable] = useState([]);

  const [promptId, setPromptId] = useState(randomStringRef(6) + "promptV2");

  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [focusedTarget, setForcusedTarget] = useState<any>(null);

  const [page, setPage] = useState(1);

  const [promptShow, setPromptShow] = useState(false);
  const [analysisSysMsg, setAnalysisSysMsg] = useState("");
  const [analysisUserMsg, setAnalysisUserMsg] = useState("");
  const [analysisSysMsgStr, setAnalysisSysMsgStr] = useState("");
  const [analysisUserMsgStr, setAnalysisUserMsgStr] = useState("");

  const [basicSections, setBasicSections] = useState<
    { t: string; p: string }[]
  >([]);

  const [o1Str, setO1Str] = useState("");
  const [assessmentStr, setAssessmentStr] = useState("");
  const [updateSections, setUpdateSections] = useState<
    { t: string; p: string }[]
  >([]);

  const [openCreateQA, setOpenCreateQA] = useState("");
  const [numberOfQA, setNumberOfQA] = useState(3);
  const [promptLoading, setPromptLoading] = useState(false);
  const [showQAprompt, setShowQAprompt] = useState(false);
  const [qaSysmsg, setQaSysmsg] = useState("");
  const [qaUsermsg, setQaUsermsg] = useState("");

  const [openAutoCreateSection, setOpenAutoCreateSection] = useState(false);
  const [showAutoSectionPrompt, setShowAutoSectionPrompt] = useState(false);
  const [autoSection1Title, setAutoSection1Title] = useState("Intro");
  const [autoSection1Content, setAutoSection1Content] = useState(
    "Write a paragraph that provides an overview about the benefits of being a better coach"
  );
  const [numberOfAutoSections, setNumberOfAutoSections] = useState(3);
  const [autoSectionSysmsg, setAutoSectionSysmsg] = useState("");
  const [autoSectionUsermsg, setAutoSectionUsermsg] = useState("");

  useEffect(() => {
    if (props.editPrompt) {
      setPromptName(props.editPrompt.name);
      setPromptDescription(props.editPrompt.description);
      setQuestions(JSON.parse(props.editPrompt.questions));
      setQEdit(
        Array(JSON.parse(props.editPrompt.questions).length).fill(false)
      );
      setDemoAnswers(JSON.parse(props.editPrompt.demoAnswers));
      setSystemMsg(
        props.editPrompt.promptType === "raw" ? props.editPrompt.systemMsg : ""
      );
      setPromptStr(
        props.editPrompt.promptType === "raw" ? props.editPrompt.prompt : ""
      );
      setSystemMsgJosh(
        props.editPrompt.promptType === "josh" ? props.editPrompt.systemMsg : ""
      );
      setPromptStrJosh(
        props.editPrompt.promptType === "josh" ? props.editPrompt.prompt : ""
      );
      setPromptId(props.editPrompt.id);
      setBasicQA(JSON.parse(props.editPrompt.basicQA));
      setPromptType(props.editPrompt.promptType);
      setO1Str(
        props.editPrompt.clientAnalysis ? props.editPrompt.clientAnalysis : ""
      );
      setBasicSections(
        props.editPrompt.basicSections &&
          isJsonString(props.editPrompt.basicSections)
          ? JSON.parse(props.editPrompt.basicSections)
          : []
      );
      setUpdateSections(
        props.editPrompt.report && isJsonString(props.editPrompt.report)
          ? JSON.parse(props.editPrompt.report)
          : []
      );
      setSEdit(
        Array(JSON.parse(props.editPrompt.basicSections).length).fill(false)
      );
      setUpdateSectionsEditable(
        props.editPrompt.report && isJsonString(props.editPrompt.report)
          ? Array(JSON.parse(props.editPrompt.report).length).fill(false)
          : []
      );
    } else {
      setBasicQA(basicQuestions());
    }
  }, [JSON.stringify(props.editPrompt)]);

  useEffect(() => {
    if (err) {
      setTimeout(() => {
        setErr("");
      }, 3000);
    }
  }, [err]);

  useEffect(() => {
    setQaSysmsg(
      `You're an intelligent AI who creates survey questions based on the name and description of the tool:\n Name: ${promptName}\n Description: ${promptDescription}\n The goal of these questions is to get answers that would help create the tool.`
    );

    let arr = [];
    for (let i = 0; i < numberOfQA; i++) {
      arr.push({ question: "question text", answer: "answer text" });
    }
    setQaUsermsg(
      `Create a survey with ${numberOfQA} question${
        numberOfQA > 1 ? "s" : ""
      }. Add example${numberOfQA > 1 ? "s" : ""} of answer${
        numberOfQA > 1 ? "s" : ""
      } to these question${
        numberOfQA > 1 ? "s" : ""
      }. Please respond only with a json object in this format: ${JSON.stringify(
        arr
      )}.`
    );
  }, [promptName, promptDescription, numberOfQA]);

  const createQA = async () => {
    if (numberOfQA < 1) return;

    setLoading(true);
    const res: any = await getChatCompletion([
      {
        role: "system",
        content: qaSysmsg
      },
      {
        role: "user",
        content: qaUsermsg
      }
    ]);

    setLoading(false);
    if (res.data) {
      setErr("");
      const txt = res?.data?.choices?.[0]?.message?.content.trim();
      let questionsArr = [...questions];
      let answerArr = [...demoAnswers];

      if (txt) {
        if (isJsonString(txt)) {
          for (let k = 0; k < JSON.parse(txt).length; k++) {
            setQuestions((current) => [
              ...current,
              JSON.parse(txt)[k].question
            ]);
            questionsArr.push(JSON.parse(txt)[k].question);
            setDemoAnswers((current) => [
              ...current,
              JSON.parse(txt)[k].answer
            ]);
            answerArr.push(JSON.parse(txt)[k].answer);
          }
          setOpenCreateQA(false);
          setNumberOfQA(3);
          getAssessmentPrompt(questionsArr, answerArr);
        } else {
          createQA();
        }
      }
    } else {
      setErr("Invalid request");
    }
  };

  useEffect(() => {
    setAutoSectionSysmsg(
      `You're an intelligent and creative coach who creates reports for individuals based on the tool name, tool description, client survey, and client assessment. A report is made of sections, and every section has a title and content. You will be given the first section title and the instruction to create the content for this section. Your goal is to create ${numberOfAutoSections} section, including the one given to you.`
    );

    let arr = [];
    for (let i = 0; i < numberOfAutoSections; i++) {
      arr.push({ Title: "Title text", Instruction: "Instruction text" });
    }
    setAutoSectionUsermsg(
      `Here is the title and instruction for section 1.\n {Title: "${autoSection1Title}", Instruction: "${autoSection1Content}"}\n Including the first section, please create ${numberOfAutoSections} section title${
        numberOfAutoSections > 1 ? "s" : ""
      }, including ${numberOfAutoSections > 1 ? "their" : "its"} instruction${
        numberOfAutoSections > 1 ? "s" : ""
      }. Respond in this format: ${JSON.stringify(arr)}`
    );
  }, [autoSection1Title, autoSection1Content, numberOfAutoSections]);

  const autoCreateSection = async () => {
    if (numberOfAutoSections < 1) return;

    setLoading(true);
    const res: any = await getChatCompletion([
      {
        role: "system",
        content: autoSectionSysmsg
      },
      {
        role: "user",
        content: autoSectionUsermsg
      }
    ]);

    setLoading(false);
    if (res.data) {
      setErr("");
      const txt = res?.data?.choices?.[0]?.message?.content.trim();
      if (txt) {
        if (isJsonString(txt)) {
          for (let i = 0; i < JSON.parse(txt).length; i++) {
            if (i >= numberOfAutoSections) break;

            setBasicSections((current) => [
              ...current,
              {
                t: JSON.parse(txt)[i].Title,
                p: JSON.parse(txt)[i].Instruction
              }
            ]);
            setSEdit((current) => [...current, false]);
          }
        }
        setOpenAutoCreateSection(false);
        setNumberOfAutoSections(3);
      }
    } else {
      setErr("Invalid request");
    }
  };

  const ai1Result = async (event: any) => {
    event?.preventDefault();

    // if (questions.length === 0) {
    //   setErr("Please add questions");
    //   return;
    // }
    if (
      (promptType === "raw" && !systemMsg) ||
      (promptType === "josh" && !systemMsgJosh)
    ) {
      setErr("Please type system message");
      return;
    }
    if (
      (promptType === "raw" && !promptStr) ||
      (promptType === "josh" && !promptStrJosh)
    ) {
      setErr("Please type user message");
      return;
    }
    setLoading(true);

    let systemMsgStr = systemMsg;
    let promptStrr = promptStr;

    for (let i = 0; i < questions.length; i++) {
      systemMsgStr = systemMsgStr.replace(
        `{Q${i + 1}}`,
        questions[i] ? questions[i] : ""
      );
      promptStrr = promptStrr.replace(
        `{Q${i + 1}}`,
        questions[i] ? questions[i] : ""
      );
      systemMsgStr = systemMsgStr.replace(
        `{A${i + 1}}`,
        demoAnswers[i] ? demoAnswers[i] : ""
      );
      promptStrr = promptStrr.replace(
        `{A${i + 1}}`,
        demoAnswers[i] ? demoAnswers[i] : ""
      );
    }

    const result: any = await getChatCompletion([
      {
        role: "system",
        content: promptType === "raw" ? systemMsgStr : systemMsgJosh
      },
      {
        role: "user",
        content: promptType === "raw" ? promptStrr : promptStrJosh
      }
    ]);
    setLoading(false);
    if (result.data) {
      setErr("");
      const txt = result?.data?.choices?.[0]?.message?.content.trim();
      if (txt) {
        setAssessmentStr(txt);
        let str = txt + "\n\nThe following is the survey given to the user:";
        let symbol = ["!", ".", "?"];

        for (let k = 0; k < questions.length; k++) {
          str += `\n\nQuestion: ${
            symbol.includes(questions[k].substr(-1))
              ? questions[k]
              : questions[k] + "."
          }\nAnswer: ${
            symbol.includes(demoAnswers[k].substr(-1))
              ? demoAnswers[k]
              : demoAnswers[k] + "."
          }`;
        }
        setO1Str(str);
        await savePrompt({
          id: promptId,
          name: promptName,
          description: promptDescription,
          email: props.userinfo.email,
          questions: JSON.stringify(questions),
          demoAnswers: JSON.stringify(demoAnswers),
          clientAnalysis: str,
          systemMsg: promptType === "raw" ? systemMsg : systemMsgJosh,
          prompt: promptType === "raw" ? promptStr : promptStrJosh,
          advanced: false,
          basicQA: JSON.stringify(basicQA),
          promptType
        });
        setCopyLink("");
        setPage(2);
      }
    } else {
      setErr("Invalid request");
    }
  };

  useEffect(() => {
    let basicSectionsArr = basicSections;
    let sectionObj = {};
    let sectionOutObj = {};

    for (let k = 0; k < basicSectionsArr.length; k++) {
      for (let n = 0; n < questions.length; n++) {
        basicSectionsArr[k].t = basicSectionsArr[k].t.replace(
          `{Q${n + 1}}`,
          questions[n] ? questions[n] : ""
        );
        basicSectionsArr[k].t = basicSectionsArr[k].t.replace(
          `{A${n + 1}}`,
          demoAnswers[n] ? demoAnswers[n] : ""
        );
        basicSectionsArr[k].p = basicSectionsArr[k].p.replace(
          `{Q${n + 1}}`,
          questions[n] ? questions[n] : ""
        );
        basicSectionsArr[k].p = basicSectionsArr[k].p.replace(
          `{A${n + 1}}`,
          demoAnswers[n] ? demoAnswers[n] : ""
        );
      }

      sectionObj = {
        ...sectionObj,
        [basicSectionsArr[k].t]: basicSectionsArr[k].p
      };
      sectionOutObj = {
        ...sectionOutObj,
        [basicSectionsArr[k].t]: `content${k + 1}`
      };
    }

    let str = "";
    let symbol = ["!", ".", "?"];

    for (let k = 0; k < questions.length; k++) {
      str += `\nQuestion: ${
        symbol.includes(questions[k].substr(-1))
          ? questions[k]
          : questions[k] + "."
      }\nAnswer: ${
        symbol.includes(demoAnswers[k].substr(-1))
          ? demoAnswers[k]
          : demoAnswers[k] + "."
      }`;
    }

    setAnalysisSysMsg(
      `You're an intelligent assistant who creates reports for clients based on their personal assessment. Every report has sections, and every section has a title and content. You will be given a title and instruction for each section – use the instruction to create the content for the section. Use the client assessment and client analysis as context:\n\nClient assessment:\n\n${assessmentStr}\n\nClient survey:\n${str}`
    );
    setAnalysisUserMsg(
      `Create a report using the client assessment and survey. The following object includes the section titles and section instructions. Use the section instructions to create the content for each section. ${JSON.stringify(
        sectionObj
      )}. Please respond with a json object in the following format: ${JSON.stringify(
        sectionOutObj
      )}`
    );
  }, [JSON.stringify(basicSections), assessmentStr]);

  const ai2Result = async (event: any) => {
    event?.preventDefault();

    if (basicSections.length === 0) {
      setErr("Please create sections");
      return;
    }

    setLoading(true);
    let basicSectionsArr = basicSections;
    let sectionObj = {};
    let sectionOutObj = {};

    for (let k = 0; k < basicSectionsArr.length; k++) {
      for (let n = 0; n < questions.length; n++) {
        basicSectionsArr[k].t = basicSectionsArr[k].t.replace(
          `{Q${n + 1}}`,
          questions[n] ? questions[n] : ""
        );
        basicSectionsArr[k].t = basicSectionsArr[k].t.replace(
          `{A${n + 1}}`,
          demoAnswers[n] ? demoAnswers[n] : ""
        );
        basicSectionsArr[k].p = basicSectionsArr[k].p.replace(
          `{Q${n + 1}}`,
          questions[n] ? questions[n] : ""
        );
        basicSectionsArr[k].p = basicSectionsArr[k].p.replace(
          `{A${n + 1}}`,
          demoAnswers[n] ? demoAnswers[n] : ""
        );
      }

      sectionObj = {
        ...sectionObj,
        [basicSectionsArr[k].t]: basicSectionsArr[k].p
      };
      sectionOutObj = {
        ...sectionOutObj,
        [basicSectionsArr[k].t]: `content${k + 1}`
      };
    }
    const result: any = await getChatCompletion([
      {
        role: "system",
        content: analysisSysMsg
      },
      {
        role: "user",
        content: analysisUserMsg
      }
    ]);
    setLoading(false);
    if (result.data) {
      setErr("");
      const txt = result?.data?.choices?.[0]?.message?.content.trim();

      if (txt) {
        let arr = [];

        let str = "";
        let contentArr: any = [];

        if (isJsonString(txt)) {
          Object.keys(JSON.parse(txt)).forEach(function (key, index) {
            str += `${key}\n${JSON.parse(txt)[key]}\n`;
            arr.push({ t: key, p: JSON.parse(txt)[key] });
            contentArr.push({ title: key, body: JSON.parse(txt)[key] });
          });

          setConvStr(str);
          setContent(contentArr);
          setUpdateSections(arr);

          await savePrompt({
            id: promptId,
            name: promptName,
            email: props.userinfo.email,
            questions: JSON.stringify(questions),
            demoAnswers: JSON.stringify(demoAnswers),
            clientAnalysis: o1Str,
            systemMsg: promptType === "raw" ? systemMsg : systemMsgJosh,
            prompt: promptType === "raw" ? promptStr : promptStrJosh,
            advanced: false,
            basicQA: JSON.stringify(basicQA),
            basicSections: JSON.stringify(basicSections),
            report: JSON.stringify(arr),
            promptType
          });

          setUpdateSectionsEditable(
            Array(arr.length).fill({ t: false, p: false })
          );

          setCopyLink("");
          setPage(3);
        } else {
          ai2Result(null);
        }
      } else {
        ai2Result(null);
      }
    } else {
      setErr("Invalid request");
      ai2Result(null);
    }
  };

  const save = async (event: any) => {
    event?.preventDefault();
    setErr("");
    setSuccess("");

    if (updateSections.length === 0) {
      return;
    }

    setLoading(true);
    const res: any = await savePrompt({
      id: promptId,
      name: promptName,
      email: props.userinfo.email,
      questions: JSON.stringify(questions),
      demoAnswers: JSON.stringify(demoAnswers),
      clientAnalysis: o1Str,
      systemMsg: promptType === "raw" ? systemMsg : systemMsgJosh,
      prompt: promptType === "raw" ? promptStr : promptStrJosh,
      advanced: false,
      basicQA: JSON.stringify(basicQA),
      basicSections: JSON.stringify(basicSections),
      report: JSON.stringify(updateSections),
      promptType
    });
    if (res.data) {
      if (res.data.success) {
        if (res.data.prompt) {
          props.setEditPrompt(res.data.prompt);
          setCopyLink(`${window.location.origin}/survey/${promptId}`);
        }
      } else {
        setErr(res.data.err?.message);
      }
    } else {
      setErr(res.err?.message);
    }
    setLoading(false);
  };

  const enterQuestion = (e: any) => {
    if (e.key === "Enter") {
      addQuery();
    }
  };

  const addQuery = () => {
    if (q && demoA) {
      setQuestions((current) => [...current, q]);
      setDemoAnswers((current) => [...current, demoA]);
      setQEdit((current) => [...current, false]);
      setQ("");
      setDemoA("");
      setOpenQuestion(false);
    }
  };

  // const editQuery = () => {
  //   if (q && demoA && editQIndex !== null) {
  //     let questionsArr = [...questions];
  //     let demoAnswersArr = [...demoAnswers];
  //     questionsArr[editQIndex] = q;
  //     demoAnswersArr[editQIndex] = demoA;
  //     setQuestions(questionsArr);
  //     setDemoAnswers(demoAnswersArr);
  //     setEditQIndex(null);
  //     setQ("");
  //     setDemoA("");
  //   }
  // };

  const removeQuery = (index: number) => {
    let arr = [];
    let demoAnsArr = [];
    let editArr = [];
    for (let i = 0; i < questions.length; i++) {
      if (i !== index) {
        arr.push(questions[i]);
        editArr.push(qEdit[i]);
        demoAnsArr.push(demoAnswers[i]);
      }
    }
    setQuestions(arr);
    setQEdit(editArr);
    setDemoAnswers(demoAnsArr);
  };

  const forcusElement = (e: any) => {
    if (e.target) {
      setForcusedTarget(e.target);
    } else {
      setForcusedTarget(null);
    }
  };

  const insertLetter = (str: string) => {
    if (focusedTarget) {
      let textToInsert = str;
      let cursorPosition = focusedTarget.selectionStart;

      let textBeforeCursorPosition = focusedTarget.value.substring(
        0,
        cursorPosition
      );
      let textAfterCursorPosition = focusedTarget.value.substring(
        cursorPosition,
        focusedTarget.value.length
      );

      if (focusedTarget.id === "smsg") {
        if (promptType === "raw") {
          setSystemMsg(
            textBeforeCursorPosition + textToInsert + textAfterCursorPosition
          );
        } else {
          setSystemMsgJosh(
            textBeforeCursorPosition + textToInsert + textAfterCursorPosition
          );
        }
      } else if (focusedTarget.id === "prompt") {
        if (promptType === "raw") {
          setPromptStr(
            textBeforeCursorPosition + textToInsert + textAfterCursorPosition
          );
        } else {
          setPromptStrJosh(
            textBeforeCursorPosition + textToInsert + textAfterCursorPosition
          );
        }
      } else if (focusedTarget.id === "section-title") {
        setSection({
          ...section,
          t: textBeforeCursorPosition + textToInsert + textAfterCursorPosition
        });
      } else if (focusedTarget.id === "section-prompt") {
        setSection({
          ...section,
          p: textBeforeCursorPosition + textToInsert + textAfterCursorPosition
        });
      } else if (focusedTarget.id.includes("section-title-pair")) {
        let sArr = [...basicSections];
        const index = parseInt(focusedTarget.id);
        sArr[index].t =
          textBeforeCursorPosition + textToInsert + textAfterCursorPosition;
        props.setBasicSections(sArr);
      } else if (focusedTarget.id.includes("section-prompt-pair")) {
        let sArr = [...basicSections];
        const index = parseInt(focusedTarget.id);
        sArr[index].p =
          textBeforeCursorPosition + textToInsert + textAfterCursorPosition;
        props.setBasicSections(sArr);
      }
    }
  };

  const enterSection = (e: any) => {
    if (e.key === "Enter") {
      addSection();
    }
  };

  const addSection = () => {
    if (section.t && section.p) {
      props.setBasicSections((current) => [...current, section]);
      setSEdit((current) => [...current, false]);
      setSection({ t: "", p: "" });
    }
  };

  const removeSection = (index: number) => {
    let arr = [];
    let editArr = [];
    for (let i = 0; i < basicSections.length; i++) {
      if (i !== index) {
        arr.push(basicSections[i]);
        editArr.push(sEdit[i]);
      }
    }
    setSEdit(editArr);
    setBasicSections(arr);
  };

  const onReorderQuestion = (e, from, to) => {
    setQuestions(move(questions, from, to));
    setDemoAnswers(move(demoAnswers, from, to));
  };

  const onReorderSection = (e, from, to) => {
    setBasicSections(move(basicSections, from, to));
  };

  const onReorderUpdateSection = (e, from, to) => {
    setUpdateSections(move(updateSections, from, to));
  };

  const getAssessmentPrompt = async (questions, answers) => {
    setSystemMsgJosh("");
    setPromptStrJosh("");

    let qaStr = "";
    let symbol = ["!", ".", "?"];

    for (let k = 0; k < questions.length; k++) {
      qaStr += `\n\nQuestion: ${
        symbol.includes(questions[k].substr(-1))
          ? questions[k]
          : questions[k] + "."
      }\nAnswer: ${
        symbol.includes(answers[k].substr(-1)) ? answers[k] : answers[k] + "."
      }`;
    }

    if (qaStr) {
      setPromptLoading(true);
      const result: any = await getChatCompletion([
        {
          role: "system",
          content: `You are an intelligent AI who creates system messages that are used to create assistants who help clients. The system message helps set the behavior of the assistant. For example, you can modify the personality of the assistant or provide specific instructions about how it should behave throughout the conversation. The system message must start with "You are a...`
        },
        {
          role: "user",
          content: `Generate a system message for a bot whose purpose is to create an analysis of the client based on the name of the tool, the description of the tool, and the survey of the client.\n Name of tool: ${promptName}\n Description of tool: ${promptDescription}\n ${qaStr}`
        }
      ]);

      if (result.data) {
        setErr("");
        const txt = result?.data?.choices?.[0]?.message?.content.trim();

        let sysJoshStr = txt;
        sysJoshStr += qaStr;
        setSystemMsgJosh(sysJoshStr);
        setPromptStrJosh(
          `Instructions: Using the answers above, list 15 key: value pairs that describe the key elements about this client who answered these questions. Give 3 examples of Values for each Key. Output is a list of 15 key value pairs using as few words as possible. For example: Goals: Goal 1, Goal 2, Goal 3 Goal 4.`
        );
      }
      setPromptLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

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

  const editAnalysisPrompt = () => {
    setAnalysisSysMsgStr(analysisSysMsg);
    setAnalysisUserMsgStr(analysisUserMsg);
    setPromptShow(true);
  };

  const saveAnalysisPrompt = () => {
    setAnalysisSysMsg(analysisSysMsgStr);
    setAnalysisUserMsg(analysisUserMsgStr);
    setPromptShow(false);
  };

  const updateSectionsEditableHandle = (
    index: number,
    value: boolean,
    flag: string
  ) => {
    let arr = [];

    for (let i = 0; i < updateSectionsEditable.length; i++) {
      if (index === i) {
        if (flag === "t") {
          arr.push({ t: value, p: updateSectionsEditable[i].p });
        } else {
          arr.push({ t: updateSectionsEditable[i].t, p: value });
        }
      } else {
        arr.push(updateSectionsEditable[i]);
      }
    }

    setUpdateSectionsEditable(arr);
  };

  return (
    <>
      <div className="d-none">
        <div ref={pdfContentRef}>
          <PdfContent data={content} />
        </div>
      </div>
      <div
        className="v2-edit-content flex"
        style={{ paddingRight: 30, display: "flex", alignItems: "center" }}
      >
        <div className="flex">
          <BiCaretLeftCircle
            size={30}
            style={{ cursor: "pointer", marginRight: 130 }}
            onClick={() => props.setState("table")}
          />
        </div>
        <MultiStepProgressBar
          page={page}
          onPageNumberClick={(value) => {
            setPage(parseInt(value));
          }}
        />
      </div>

      <div onClick={forcusElement}>
        {page === 1 ? (
          <div className="v2-edit-content">
            <div style={{ width: "calc(100% - 30px)" }}>
              <div
                className="d-md-flex mx-md-1 align-items-center justify-content-between"
                style={{ marginTop: 20 }}
              >
                <p className="sub-title my-1" style={{ marginRight: 47 }}>
                  Report Name:
                </p>
                <div
                  className="intdiv my-1 mx-md-2"
                  style={{ width: "calc(100% - 180px)" }}
                >
                  <input
                    className="int mx-md-1 my-1"
                    style={{ minWidth: 300, padding: "4px 7px" }}
                    value={promptName}
                    onChange={(e) => setPromptName(e.target.value)}
                  />
                </div>
              </div>
              <div className="d-md-flex mx-md-1 justify-content-between ">
                <p className="sub-title my-1">Report Description:</p>
                <div
                  className="intdiv my-1 mx-md-2"
                  style={{ width: "calc(100% - 180px)" }}
                >
                  <textarea
                    className="int mx-md-1 my-1"
                    style={{ minWidth: 300, padding: "4px 7px" }}
                    value={promptDescription}
                    onChange={(e) => setPromptDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <div className="intdiv mt-0">
                <p className="lable" style={{ marginBottom: 60 }}>
                  Put what the coach will say to their client here and how to
                  use the tool.
                </p>
              </div>
            </div>
            <div
              className="d-flex align-items-center"
              style={{ marginTop: 20 }}
            >
              <OverlayTrigger
                rootClose
                placement="right"
                overlay={
                  <Popover>
                    <Popover.Body style={{ fontFamily: "Muli-Regular" }}>
                      Create questions and make the assessment. Your analysis
                      will be created using the answers to these questions.
                    </Popover.Body>
                  </Popover>
                }
              >
                <p className="sub-title m-0">
                  Client Survey
                  <button
                    className="border-0 bg-transparent"
                    style={{ marginRight: 28 }}
                  >
                    <BsQuestionCircle color="#567a73" size={14} />
                  </button>
                </p>
              </OverlayTrigger>
              <div className="mx-3 flex">
                <Button
                  // variant="success"
                  onClick={() => setOpenCreateQA(true)}
                  // style={{ fontSize: 13, fontFamily: "Muli-Regular" }}
                  className="btn-ele-prompt flex mx-3"
                >
                  Auto-Generate
                </Button>
                {/* <BsPlusCircle
                  size={17}
                  style={{ cursor: "pointer", marginLeft: 7 }}
                  onClick={() => setOpenQuestion(true)}
                /> */}
                <Button
                  // variant="success"
                  onClick={() => setOpenQuestion(true)}
                  // style={{ fontSize: 13, fontFamily: "Muli-Regular" }}
                  className="btn-ele-prompt"
                >
                  Add Question
                </Button>
              </div>
            </div>
            <div>
              <Reorder
                reorderId="questions-list"
                reorderGroup="reorder-group"
                component="div"
                placeholderClassName="placeholder"
                draggedClassName="dragged"
                lock="horizontal"
                holdTime={50}
                touchHoldTime={50}
                mouseHoldTime={20}
                onReorder={onReorderQuestion}
                autoScroll={true}
                disabled={qEdit.includes(true) ? true : false}
                disableContextMenus={true}
                placeholder={<div className="custom-placeholder" />}
              >
                {questions &&
                  questions.map((item: string, index: number) => (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontFamily: "Muli-Regular",
                        color: "#567a73",
                        marginTop: "0.25rem",
                        cursor: "pointer",
                        padding: "3px 5px",
                        borderRadius: 5
                      }}
                      key={index}
                    >
                      <div style={{ width: "calc(100% - 70px)" }}>
                        <div className="intdiv mt-0 d-flex">
                          <div>Q: </div>
                          {qEdit[index] ? (
                            <textarea
                              className="int"
                              value={item}
                              rows={2}
                              style={{
                                width: "calc(100% - 40px)",
                                marginLeft: 10
                              }}
                              onChange={(e) => {
                                let qArr = [...questions];
                                qArr[index] = e.target.value;
                                setQuestions(qArr);
                              }}
                            ></textarea>
                          ) : (
                            item
                          )}
                        </div>
                        <div className="intdiv mt-1 d-flex">
                          <div>A:</div>
                          {qEdit[index] ? (
                            <textarea
                              className="int"
                              value={
                                demoAnswers[index] ? demoAnswers[index] : ""
                              }
                              rows={2}
                              style={{
                                width: "calc(100% - 40px)",
                                marginLeft: 10
                              }}
                              onChange={(e) => {
                                let aArr = [...demoAnswers];
                                aArr[index] = e.target.value;
                                setDemoAnswers(aArr);
                              }}
                            ></textarea>
                          ) : demoAnswers[index] ? (
                            demoAnswers[index]
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                      <div
                        style={{
                          width: 60,
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        {qEdit[index] ? (
                          <BsCheckLg
                            className="mx-1"
                            size={20}
                            style={{ cursor: "pointer" }}
                            color="#20c997"
                            onClick={() => {
                              let qEditArr = [...qEdit];
                              qEditArr[index] = false;
                              setQEdit(qEditArr);
                            }}
                          />
                        ) : (
                          <BsPencilFill
                            size={13}
                            style={{ cursor: "pointer" }}
                            className="mx-1"
                            onClick={() => {
                              let qEditArr = [...qEdit];
                              qEditArr[index] = true;
                              setQEdit(qEditArr);
                            }}
                          />
                        )}

                        <BsX
                          size={20}
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            if (qEdit[index]) {
                              let qEditArr = [...qEdit];
                              qEditArr[index] = false;
                              setQEdit(qEditArr);
                            } else {
                              removeQuery(index);
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </Reorder>
            </div>

            <div className="d-md-flex align-items-center mt-4">
              <OverlayTrigger
                rootClose
                placement="top"
                overlay={
                  <Popover>
                    <Popover.Body style={{ fontFamily: "Muli-Regular" }}>
                      The goal of this prompt is to generate an Analysis of the
                      user.
                    </Popover.Body>
                  </Popover>
                }
              >
                <p className="sub-title m-0">
                  Analysis Prompt{" "}
                  <button className="border-0 bg-transparent">
                    <BsQuestionCircle color="#567a73" size={14} />
                  </button>
                </p>
              </OverlayTrigger>
              {/*
              <FormSelect
                className="mx-md-4 py-1 mt-1"
                style={{
                  width: 150,
                  fontFamily: "Muli-Regular",
                  fontSize: 13,
                  background: "transparent",
                  color: "#567a73",
                }}
                value={promptType}
                onChange={(e) => setPromptType(e.target.value)}
              >
                <option value="raw">Raw</option>
                <option value="josh">Demo</option>
              </FormSelect>
              */}
            </div>
            <div className="mt-4">
              {/*
              <div className="mb-1">
                {questions &&
                  questions.map((item: string, index: number) => (
                    <span key={index} style={{ fontFamily: "Muli-Medium" }}>
                      <Button
                        variant="warning"
                        onClick={() => insertLetter(`{Q${index + 1}}`)}
                        style={{ fontSize: 12, padding: "5px 10px" }}
                      >
                        Q{index + 1}
                      </Button>
                      <Button
                        className="mx-2"
                        variant="success"
                        onClick={() => insertLetter(`{A${index + 1}}`)}
                        style={{ fontSize: 12, padding: "5px 10px" }}
                      >
                        A{index + 1}
                      </Button>
                    </span>
                  ))}
              </div>
            */}
              {promptLoading && <BeatLoader color="#f42f3b" size={12} />}
              <div className="intdiv">
                <p className="lable">System message</p>
                <textarea
                  id="smsg"
                  className="int"
                  value={promptType === "raw" ? systemMsg : systemMsgJosh}
                  rows={8}
                  onChange={(e) => {
                    forcusElement(e);
                    if (promptType === "raw") {
                      setSystemMsg(e.target.value);
                    } else {
                      setSystemMsgJosh(e.target.value);
                    }
                  }}
                  disabled={promptLoading}
                ></textarea>
              </div>
              <div className="intdiv">
                <p className="lable">User message</p>
                <textarea
                  id="prompt"
                  className="int"
                  value={promptType === "raw" ? promptStr : promptStrJosh}
                  rows={5}
                  onChange={(e) => {
                    forcusElement(e);
                    if (promptType === "raw") {
                      setPromptStr(e.target.value);
                    } else {
                      setPromptStrJosh(e.target.value);
                    }
                  }}
                  disabled={promptLoading}
                ></textarea>
              </div>
            </div>
            {err && <p className="err">{err}</p>}
            <div className="mt-4">
              <ButtonEle title="generate" handle={ai1Result} />
            </div>
            {loading && (
              <div className="loading">
                <BeatLoader color="#f42f3b" size={12} />
              </div>
            )}
          </div>
        ) : page === 2 ? (
          <div className="v2-edit-content">
            <div className="pb-1">
              <OverlayTrigger
                rootClose
                placement="right"
                overlay={
                  <Popover>
                    <Popover.Body style={{ fontFamily: "Muli-Regular" }}>
                      This is the analysis created by ChatGPT using the
                      Assessment.
                    </Popover.Body>
                  </Popover>
                }
              >
                <p className="sub-title m-0" style={{ width: 160 }}>
                  Client Analysis
                  <button className="border-0 bg-transparent">
                    <BsQuestionCircle color="#567a73" size={14} />
                  </button>
                </p>
              </OverlayTrigger>

              <div className="intdiv d-flex">
                <textarea
                  className="int"
                  value={o1Str}
                  rows={12}
                  onChange={(e) => {
                    setO1Str(e.target.value);
                  }}
                  disabled={!o1StrEditable}
                ></textarea>
                {o1StrEditable ? (
                  <BsCheckLg
                    className="m-2"
                    size={20}
                    style={{ cursor: "pointer" }}
                    color="#20c997"
                    onClick={() => setO1StrEditable(false)}
                  />
                ) : (
                  <BsPencilFill
                    color="rgb(86, 122, 115)"
                    style={{ cursor: "pointer" }}
                    className="m-2"
                    onClick={() => setO1StrEditable(true)}
                  />
                )}
              </div>
              <div className="mt-4">
                <div className="mt-4 mb-2 d-flex align-items-center">
                  <p className="sub-title m-0">Create Report Section </p>
                  <div className="pb-1">
                    <OverlayTrigger
                      rootClose
                      placement="right"
                      overlay={
                        <Popover>
                          <Popover.Body style={{ fontFamily: "Muli-Regular" }}>
                            Sections are parts of a page. For example, a blog
                            post might have 3 sections: an intro, overview, and
                            conclusion. Each section is created using a prompt.
                          </Popover.Body>
                        </Popover>
                      }
                    >
                      <button className="border-0 bg-transparent">
                        <BsQuestionCircle color="#567a73" />
                      </button>
                    </OverlayTrigger>
                  </div>
                  {/* <BsPlusCircle
                    size={17}
                    style={{ cursor: "pointer", marginLeft: 7 }}
                    onClick={() => setOpenSection(true)}
                    color="#28d896"
                  /> */}
                  <Button
                    onClick={() => setOpenAutoCreateSection(true)}
                    className="btn-ele-prompt flex mx-3"
                  >
                    Auto-Generate
                  </Button>
                  <Button
                    className="btn-ele-prompt"
                    onClick={() => setOpenSection(true)}
                    style={{ cursor: "pointer" }}
                  >
                    Add Section
                  </Button>
                </div>
                {/* <div
                  className="p-3"
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    border: "1px solid #a1d4c6",
                    borderRadius: 6,
                  }}
                >
                  <div
                    className="intdiv mt-0"
                    style={{
                      width: "calc(100% - 40px)",
                    }}
                  >
                    <textarea
                      id="section-title"
                      className="int"
                      value={section.t}
                      placeholder="Section title. For example, Overview, Summary, Introduction. This will be the name for the section."
                      rows={2}
                      onChange={(e) => {
                        forcusElement(e);
                        setSection({ ...section, t: e.target.value });
                      }}
                      onKeyUp={(e) => enterSection(e)}
                    ></textarea>
                    <textarea
                      id="section-prompt"
                      className="int"
                      value={section.p}
                      placeholder="Section Prompt. Write a prompt to generate content for the section. For example, 'Create a paragraph that summarizes the analysis and encourages them to join a coaching webclass.'"
                      rows={2}
                      onChange={(e) => {
                        forcusElement(e);
                        setSection({ ...section, p: e.target.value });
                      }}
                      onKeyUp={(e) => enterSection(e)}
                    ></textarea>
                  </div>
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      cursor: "pointer",
                      marginLeft: "10px",
                      paddingBottom: "35px",
                    }}
                    onClick={() => addSection()}
                  >
                    <BsCheckLg size={30} color="#20c997" />
                  </div>
                </div> */}
                <div style={{ marginTop: 20 }}>
                  <div>
                    <Reorder
                      reorderId="sections-list"
                      reorderGroup="reorder-group"
                      component="div"
                      placeholderClassName="placeholder"
                      draggedClassName="dragged"
                      lock="horizontal"
                      holdTime={50}
                      touchHoldTime={50}
                      mouseHoldTime={20}
                      onReorder={onReorderSection}
                      autoScroll={true}
                      disabled={sEdit.includes(true) ? true : false}
                      disableContextMenus={true}
                      placeholder={<div className="custom-placeholder" />}
                    >
                      {basicSections &&
                        basicSections.map(
                          (item: { t: string; p: string }, index: number) => (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                fontFamily: "Muli-Regular",
                                color: "#567a73",
                                marginTop: "0.25rem",
                                cursor: "pointer",
                                padding: "3px 5px",
                                borderRadius: 5,
                                border: "1px solid #a1d4c6"
                              }}
                              key={index}
                            >
                              <div
                                className="intdiv mt-0"
                                style={{
                                  width: "calc(100% - 60px)",
                                  fontFamily: "Muli-Regular",
                                  color: "#567a73"
                                }}
                              >
                                <div className="d-md-flex">
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      whiteSpace: "nowrap",
                                      width: "100%"
                                    }}
                                  >
                                    <div style={{ marginRight: 33 }}>
                                      Section Title:{" "}
                                    </div>
                                    <div style={{ width: "100%" }}>
                                      {sEdit[index] ? (
                                        <textarea
                                          id={`${index}section-title-pair`}
                                          className="int"
                                          value={item.t}
                                          rows={2}
                                          style={{
                                            width: "calc(100% - 40px)",
                                            marginLeft: 10
                                          }}
                                          onChange={(e) => {
                                            forcusElement(e);
                                            let sArr = [...basicSections];
                                            sArr[index].t = e.target.value;
                                            props.setBasicSections(sArr);
                                          }}
                                        ></textarea>
                                      ) : (
                                        item.t
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="d-md-flex">
                                  <div
                                    style={{
                                      width: "fit-content",
                                      display: "flex",
                                      alignItems: "left",
                                      justifyContent: "space-between",
                                      whiteSpace: "nowrap",
                                      paddingTop: 10,
                                      width: "100%"
                                    }}
                                  >
                                    <div style={{ marginRight: 10 }}>
                                      Section Prompt:{" "}
                                    </div>
                                    <div
                                      style={{
                                        whiteSpace: "normal",
                                        alignItems: "center",
                                        textAlign: "left",
                                        width: "100%"
                                      }}
                                    >
                                      {sEdit[index] ? (
                                        <textarea
                                          id={`${index}section-prompt-pair`}
                                          className="int"
                                          value={item.p}
                                          rows={5}
                                          style={{
                                            width: "calc(100% - 40px)",
                                            marginLeft: 10
                                          }}
                                          onChange={(e) => {
                                            forcusElement(e);
                                            let sArr = [...basicSections];
                                            sArr[index].p = e.target.value;
                                            props.setBasicSections(sArr);
                                          }}
                                        ></textarea>
                                      ) : (
                                        item.p
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div
                                style={{
                                  width: 60,
                                  display: "flex",
                                  alignItems: "center"
                                }}
                              >
                                {sEdit[index] ? (
                                  <BsCheckLg
                                    className="mx-1"
                                    size={20}
                                    style={{ cursor: "pointer" }}
                                    color="#20c997"
                                    onClick={() => {
                                      let sEditArr = [...sEdit];
                                      sEditArr[index] = false;
                                      setSEdit(sEditArr);
                                    }}
                                  />
                                ) : (
                                  <BsPencilFill
                                    size={13}
                                    style={{ cursor: "pointer" }}
                                    className="mx-1"
                                    onClick={() => {
                                      let sEditArr = [...sEdit];
                                      sEditArr[index] = true;
                                      setSEdit(sEditArr);
                                    }}
                                  />
                                )}
                                <BsX
                                  size={20}
                                  style={{ cursor: "pointer" }}
                                  onClick={() => {
                                    if (sEdit[index]) {
                                      let sEditArr = [...sEdit];
                                      sEditArr[index] = false;
                                      setSEdit(sEditArr);
                                    } else {
                                      removeSection(index);
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          )
                        )}
                    </Reorder>
                  </div>
                </div>
                {err && <p className="err">{err}</p>}
                <div className="mt-4">
                  <ButtonEle
                    title="create report"
                    handle={ai2Result}
                    style={{ margin: 5 }}
                  />
                  <ButtonEle
                    title="edit prompt"
                    handle={editAnalysisPrompt}
                    style={{ margin: 5 }}
                  />
                </div>
                {loading && (
                  <div className="loading">
                    <BeatLoader color="#f42f3b" size={12} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="v2-edit-content">
            <div className="chat-zone d-flex justify-content-between align-items-center">
              <p className="sub-title mb-2">Report</p>
              <div className="cancel">
                <div>
                  <BsShare size={16} onClick={() => setOpen(true)} />
                </div>
                <div className="mx-3">
                  <BsDownload size={18} onClick={() => exportPdf()} />
                </div>
              </div>
            </div>
            <div>
              {/* <Reorder
                reorderId="updateSections-list"
                reorderGroup="reorder-group"
                component="div"
                placeholderClassName="placeholder"
                draggedClassName="dragged"
                lock="horizontal"
                holdTime={50}
                touchHoldTime={50}
                mouseHoldTime={20}
                onReorder={onReorderUpdateSection}
                autoScroll={true}
                disabled={false}
                disableContextMenus={true}
                placeholder={<div className="custom-placeholder" />}
              > */}
              <Table>
                <tbody>
                  {updateSections.length > 0 &&
                    updateSections.map(
                      (item: { t: string; p: string }, index: number) => (
                        <tr key={index}>
                          <td
                            style={{
                              verticalAlign: "top",
                              paddingRight: "10px"
                            }}
                          >
                            <div
                              style={{
                                fontFamily: "Muli-Regular",

                                cursor: "pointer",
                                padding: "3px 5px"
                              }}
                            >
                              <div className="intdiv d-flex">
                                <textarea
                                  className="int black"
                                  style={{ fontWeight: "bold", fontSize: 18 }}
                                  value={item.t}
                                  rows={2}
                                  onChange={(e) => {
                                    let arr = [...updateSections];
                                    arr[index].t = e.target.value;
                                    setUpdateSections(arr);
                                  }}
                                  disabled={!updateSectionsEditable[index].t}
                                ></textarea>
                                {updateSectionsEditable[index].t ? (
                                  <BsCheckLg
                                    className="m-2"
                                    size={20}
                                    style={{ cursor: "pointer" }}
                                    color="#20c997"
                                    onClick={() =>
                                      updateSectionsEditableHandle(
                                        index,
                                        false,
                                        "t"
                                      )
                                    }
                                  />
                                ) : (
                                  <BsPencilFill
                                    color="rgb(86, 122, 115)"
                                    style={{ cursor: "pointer" }}
                                    className="m-2"
                                    onClick={() =>
                                      updateSectionsEditableHandle(
                                        index,
                                        true,
                                        "t"
                                      )
                                    }
                                  />
                                )}
                              </div>
                              <div className="intdiv d-flex">
                                <textarea
                                  className="int black"
                                  value={item.p}
                                  rows={4}
                                  onChange={(e) => {
                                    let arr = [...updateSections];
                                    arr[index].p = e.target.value;
                                    setUpdateSections(arr);
                                  }}
                                  disabled={!updateSectionsEditable[index].p}
                                ></textarea>
                                {updateSectionsEditable[index].p ? (
                                  <BsCheckLg
                                    className="m-2"
                                    size={20}
                                    style={{ cursor: "pointer" }}
                                    color="#20c997"
                                    onClick={() =>
                                      updateSectionsEditableHandle(
                                        index,
                                        false,
                                        "p"
                                      )
                                    }
                                  />
                                ) : (
                                  <BsPencilFill
                                    color="rgb(86, 122, 115)"
                                    style={{ cursor: "pointer" }}
                                    className="m-2"
                                    onClick={() =>
                                      updateSectionsEditableHandle(
                                        index,
                                        true,
                                        "p"
                                      )
                                    }
                                  />
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                </tbody>
              </Table>
              {/* </Reorder> */}
            </div>

            {err && <p className="err">{err}</p>}
            {success && <p className="success">{success}</p>}

            {updateSections.length > 0 && (
              <div className="d-md-flex justify-content-between mt-4">
                <ButtonEle title="generate" handle={save} />
                {copyLink && (
                  <CopyBtn btn={true} text="Copy link" value={copyLink} />
                )}
              </div>
            )}

            {loading && (
              <div className="loading">
                <BeatLoader color="#f42f3b" size={12} />
              </div>
            )}
          </div>
        )}
      </div>
      <Modal show={open} onHide={() => setOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Share the conversation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ShareChat
            userEmail={props.userinfo.email}
            filename="Reinvent.pdf"
            filetype="application/pdf"
            filecontent={convStr}
          />
        </Modal.Body>
      </Modal>
      <Modal show={openQuestion} onHide={() => setOpenQuestion(false)}>
        <Modal.Header closeButton>
          <Modal.Title> Client Survey</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="intdiv mt-0">
            <input
              className="int mt-0"
              placeholder="question"
              value={q}
              type="text"
              onChange={(e) => setQ(e.target.value)}
              onKeyUp={(e) => enterQuestion(e)}
            />
          </div>
          <div className="intdiv mt-0">
            <input
              className="int"
              placeholder="answer (demo)"
              value={demoA}
              type="text"
              onChange={(e) => setDemoA(e.target.value)}
              onKeyUp={(e) => enterQuestion(e)}
            />
          </div>
          <div className="mt-2 text-center">
            <ButtonEle title="Save" handle={addQuery} />
          </div>
        </Modal.Body>
      </Modal>
      <Modal show={openCreateQA} onHide={() => setOpenCreateQA(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Q/A</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="intdiv mt-0">
            <p className="lable">how many questions do you want to add?</p>
            <input
              className="int"
              value={numberOfQA}
              onChange={(e) => {
                setNumberOfQA(parseInt(e.target.value) || "");
              }}
            />
          </div>
          <div className="m-2" style={{ textAlign: "right" }}>
            <span
              style={{
                fontSize: 13,
                color: "#23d092",
                textDecoration: "underline",
                cursor: "pointer"
              }}
              onClick={() => setShowQAprompt(!showQAprompt)}
            >
              {showQAprompt ? "Hide prompt" : "Edit prompt"}
            </span>
          </div>
          <AccordianDiv flag={showQAprompt}>
            <div className="intdiv">
              <p className="lable">System message</p>
              <textarea
                className="int"
                value={qaSysmsg}
                onChange={(e) => {
                  setQaSysmsg(e.target.value);
                }}
                rows={7}
              />
            </div>
            <div className="intdiv">
              <p className="lable">User message</p>
              <textarea
                className="int"
                value={qaUsermsg}
                onChange={(e) => {
                  setQaUsermsg(e.target.value);
                }}
                rows={4}
              />
            </div>
          </AccordianDiv>
          <div className="m-2">
            <span style={{ fontSize: 13 }}>
              * This will generate a new system message also
            </span>
          </div>
          <div className="mt-2 text-center">
            <ButtonEle title="Generate" handle={createQA} />
          </div>
          {loading && (
            <div className="loading">
              <BeatLoader color="#f42f3b" size={12} />
            </div>
          )}
        </Modal.Body>
      </Modal>
      <Modal
        show={openAutoCreateSection}
        onHide={() => setOpenAutoCreateSection(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Auto create section</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="intdiv">
            <p className="lable">What is the name of the first section?</p>
            <input
              className="int"
              value={autoSection1Title}
              onChange={(e) => {
                setAutoSection1Title(e.target.value);
              }}
            />
          </div>
          <div className="intdiv">
            <p className="lable">What content do you want in this section?</p>
            <textarea
              className="int"
              value={autoSection1Content}
              onChange={(e) => {
                setAutoSection1Content(e.target.value);
              }}
              rows={4}
            />
          </div>
          <div className="intdiv">
            <p className="lable">
              How many sections do you want in the report?
            </p>
            <input
              className="int"
              value={numberOfAutoSections}
              onChange={(e) => {
                setNumberOfAutoSections(parseInt(e.target.value) || "");
              }}
            />
          </div>
          <div className="m-2" style={{ textAlign: "right" }}>
            <span
              style={{
                fontSize: 13,
                color: "#23d092",
                textDecoration: "underline",
                cursor: "pointer"
              }}
              onClick={() => setShowAutoSectionPrompt(!showAutoSectionPrompt)}
            >
              {showAutoSectionPrompt ? "Hide prompt" : "Edit prompt"}
            </span>
          </div>
          <AccordianDiv flag={showAutoSectionPrompt}>
            <div className="intdiv">
              <p className="lable">System message</p>
              <textarea
                className="int"
                value={autoSectionSysmsg}
                onChange={(e) => {
                  setAutoSectionSysmsg(e.target.value);
                }}
                rows={7}
              />
            </div>
            <div className="intdiv">
              <p className="lable">User message</p>
              <textarea
                className="int"
                value={autoSectionUsermsg}
                onChange={(e) => {
                  setAutoSectionUsermsg(e.target.value);
                }}
                rows={7}
              />
            </div>
          </AccordianDiv>

          <div className="mt-2 text-center">
            <ButtonEle title="Generate" handle={autoCreateSection} />
          </div>
          {loading && (
            <div className="loading">
              <BeatLoader color="#f42f3b" size={12} />
            </div>
          )}
        </Modal.Body>
      </Modal>
      <Modal show={promptShow} onHide={() => setPromptShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Prompt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="intdiv mt-0">
            <p className="lable">System message</p>
            <textarea
              className="int mt-0"
              placeholder=""
              value={analysisSysMsgStr}
              rows={12}
              onChange={(e) => setAnalysisSysMsgStr(e.target.value)}
            />
          </div>
          <div className="intdiv mt-0">
            <p className="lable">User message</p>
            <textarea
              className="int"
              placeholder=""
              value={analysisUserMsgStr}
              rows={8}
              onChange={(e) => setAnalysisUserMsgStr(e.target.value)}
            />
          </div>
          <div className="mt-2 text-center">
            <ButtonEle title="Save" handle={saveAnalysisPrompt} />
          </div>
        </Modal.Body>
      </Modal>
      <Modal show={openSection} onHide={() => setOpenSection(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Report Section</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            className="p-3"
            style={{
              display: "flex",
              alignItems: "flex-end",
              border: "1px solid #a1d4c6",
              borderRadius: 6
            }}
          >
            <div
              className="intdiv mt-0"
              style={{
                width: "calc(100% - 40px)"
              }}
            >
              <textarea
                id="section-title"
                className="int"
                value={section.t}
                placeholder="Section title. For example, Overview, Summary, Introduction. This will be the name for the section."
                rows={6}
                onChange={(e) => {
                  forcusElement(e);
                  setSection({ ...section, t: e.target.value });
                }}
                onKeyUp={(e) => enterSection(e)}
              ></textarea>
              <textarea
                id="section-prompt"
                className="int"
                value={section.p}
                placeholder="Section Prompt. Write a prompt to generate content for the section. For example, 'Create a paragraph that summarizes the analysis and encourages them to join a coaching webclass.'"
                rows={6}
                onChange={(e) => {
                  forcusElement(e);
                  setSection({ ...section, p: e.target.value });
                }}
                onKeyUp={(e) => enterSection(e)}
              ></textarea>
            </div>
            <div
              style={{
                width: "30px",
                height: "30px",
                cursor: "pointer",
                marginLeft: "10px",
                paddingBottom: "35px"
              }}
              onClick={() => addSection()}
            >
              <BsCheckLg size={30} color="#20c997" />
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default PromptEdit;
