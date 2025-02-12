//@ts-nocheck

import { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Popover,
  OverlayTrigger,
  FormSelect
} from "react-bootstrap";
import { render } from "react-dom";
import Reorder, {
  reorder,
  reorderImmutable,
  reorderFromTo,
  reorderFromToImmutable
} from "react-reorder";
import move from "lodash-move";
import ButtonEle from "../../components/buttonEle";
import {
  BsX,
  BsExclamationCircle,
  BsPencilFill,
  BsCheckLg
} from "react-icons/bs";
import { FaSave } from "react-icons/fa";
import { savePrompt } from "../../api/post";
import { BeatLoader } from "react-spinners";
import { BiCaretLeftCircle } from "react-icons/bi";
import { randomStringRef, basicQuestions } from "../../service";
import CopyPanel from "../../components/copyPanel";
import ShareSocial from "../../components/shareSocial";
import PromptChat from "../chat/promptChat";
import UpdateCopyPanel from "../../components/updateCopyPanel";

function PromptEdit(props: any) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [demoAnswers, setDemoAnswers] = useState<string[]>([]);
  const [demoA, setDemoA] = useState("");
  const [q, setQ] = useState("");
  const [qEdit, setQEdit] = useState<boolean[]>([]);
  // const [editQIndex, setEditQIndex] = useState<number | null>(null);
  const [promptName, setPromptName] = useState("");
  const [systemMsg, setSystemMsg] = useState("");
  const [promptStr, setPromptStr] = useState("");
  const [basicQA, setBasicQA] = useState<
    { label: string; question: string; answer: string }[]
  >([]);
  const [section, setSection] = useState<{ t: string; p: string }>({
    t: "",
    p: ""
  });
  // const [editSectionIndex, setEditSectionIndex] = useState<number | null>(null);
  const [basicSections, setBasicSections] = useState<
    { t: string; p: string }[]
  >([]);
  const [sEdit, setSEdit] = useState<boolean[]>([]);

  const [promptId, setPromptId] = useState(randomStringRef(6) + "promptV1");

  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [createShow, setCreateShow] = useState(false);

  const [focusedTarget, setForcusedTarget] = useState<any>(null);
  const [advanced, setAdvanced] = useState(false);
  const [advancedStr, setAdvancedStr] = useState("");

  const [chatKey, setChatKey] = useState(randomStringRef(3));

  const toggleCreateShow = () => {
    setCreateShow(!createShow);
  };

  useEffect(() => {
    if (props.editPrompt) {
      setPromptName(props.editPrompt.name);
      setQuestions(JSON.parse(props.editPrompt.questions));
      setQEdit(
        Array(JSON.parse(props.editPrompt.questions).length).fill(false)
      );
      setDemoAnswers(JSON.parse(props.editPrompt.demoAnswers));
      setSystemMsg(props.editPrompt.systemMsg);
      setPromptStr(props.editPrompt.prompt);
      setPromptId(props.editPrompt.id);
      setAdvanced(
        props.editPrompt.advanced && props.editPrompt.advanced === "true"
      );
      setAdvancedStr(props.editPrompt.advanced);
      setBasicQA(JSON.parse(props.editPrompt.basicQA));
      setBasicSections(JSON.parse(props.editPrompt.basicSections));
      setSEdit(
        Array(JSON.parse(props.editPrompt.basicSections).length).fill(false)
      );

      setChatKey(randomStringRef(3));
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

  const save = async (event: any) => {
    event?.preventDefault();

    setErr("");
    setSuccess("");

    if (questions.length === 0) {
      setErr("Please add questions");
      return;
    }

    if (advanced) {
      if (!systemMsg) {
        setErr("Please type Context Prompt");
        return;
      }
      if (!promptStr) {
        setErr("Please type Opening Prompt");
        return;
      }
    }

    if (!advanced) {
      for (let i = 0; i < basicQA.length; i++) {
        if (!basicQA[i].answer) {
          setErr(`Please type ${basicQA[i].label}`);
          return;
        }
      }

      if (basicSections.length === 0) {
        setErr("Please insert sections");
        return;
      }
    }

    setLoading(true);
    const res: any = await savePrompt({
      id: promptId,
      name: promptName,
      email: props.userinfo.email,
      questions: JSON.stringify(questions),
      demoAnswers: JSON.stringify(demoAnswers),
      systemMsg,
      prompt: promptStr,
      advanced,
      basicQA: JSON.stringify(basicQA),
      basicSections: JSON.stringify(basicSections)
    });

    if (res.data) {
      if (res.data.success) {
        // toggleCreateShow();
        if (res.data.prompt) {
          props.setEditPrompt(res.data.prompt);
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

  const moveQuery = (old_index: number, new_index: number) => {
    if (0 <= new_index && new_index < questions.length) {
      let questionsArr = [...questions];
      let demoAnswersArr = [...demoAnswers];

      const temp1 = questionsArr[old_index];
      questionsArr[old_index] = questionsArr[new_index];
      questionsArr[new_index] = temp1;
      setQuestions(questionsArr);

      const temp2 = demoAnswersArr[old_index];
      demoAnswersArr[old_index] = demoAnswersArr[new_index];
      demoAnswersArr[new_index] = temp2;
      setDemoAnswers(demoAnswersArr);
    }
  };

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
        setSystemMsg(
          textBeforeCursorPosition + textToInsert + textAfterCursorPosition
        );
      } else if (focusedTarget.id === "prompt") {
        setPromptStr(
          textBeforeCursorPosition + textToInsert + textAfterCursorPosition
        );
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
      } else if (focusedTarget.id.includes("qa")) {
        updateQA(
          textBeforeCursorPosition + textToInsert + textAfterCursorPosition,
          focusedTarget.id.slice(2)
        );
      } else if (focusedTarget.id.includes("section-title-pair")) {
        let sArr = [...basicSections];
        const index = parseInt(focusedTarget.id);
        sArr[index].t =
          textBeforeCursorPosition + textToInsert + textAfterCursorPosition;
        setBasicSections(sArr);
      } else if (focusedTarget.id.includes("section-prompt-pair")) {
        let sArr = [...basicSections];
        const index = parseInt(focusedTarget.id);
        sArr[index].p =
          textBeforeCursorPosition + textToInsert + textAfterCursorPosition;
        setBasicSections(sArr);
      }
    }
  };

  const updateQA = (value: string, index: number) => {
    let arr = [...basicQA];
    arr[index]["answer"] = value;
    setBasicQA(arr);
  };

  const enterSection = (e: any) => {
    if (e.key === "Enter") {
      addSection();
    }
  };

  const addSection = () => {
    if (section.t && section.p) {
      setBasicSections((current) => [...current, section]);
      setSEdit((current) => [...current, false]);
      setSection({ t: "", p: "" });
    }
  };

  // const editSection = () => {
  //   if (section.t && section.p && editSectionIndex !== null) {
  //     let sectionArr = [...basicSections];
  //     sectionArr[editSectionIndex] = section;
  //     setBasicSections(sectionArr);
  //     setSection({ t: "", p: "" });
  //     setEditSectionIndex(null);
  //   }
  // };

  const moveSection = (old_index: number, new_index: number) => {
    if (0 <= new_index && new_index < basicSections.length) {
      let sectionArr = [...basicSections];
      const temp = sectionArr[old_index];
      sectionArr[old_index] = sectionArr[new_index];
      sectionArr[new_index] = temp;
      setBasicSections(sectionArr);
    }
  };

  const removeSection = (index: number) => {
    let arr = [];
    let editArr = [];
    for (let i = 0; i < basicSections.length; i++) {
      if (i !== index) {
        arr.push(basicSections[i]);
        editArr.push(qEdit[i]);
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

  return (
    <>
      <div
        className="d-md-flex align-items-center"
        style={{ marginBottom: 10 }}
      >
        <div>
          <BiCaretLeftCircle
            size={30}
            style={{ cursor: "pointer" }}
            onClick={() => props.setState("table")}
          />
        </div>
        <div className="d-md-flex mx-md-3 align-items-center">
          <h2 className="title my-1" style={{ width: 200 }}>
            {props.editPrompt ? "Edit" : "Create"} prompt
          </h2>
          <p className="sub-title my-1">Name:</p>
          <div className="intdiv my-1 mx-md-2">
            <input
              className="int mx-md-1 my-1"
              style={{ width: 170 }}
              value={promptName}
              onChange={(e) => setPromptName(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="edit-content" onClick={forcusElement}>
        <div style={{ width: "40%" }}>
          <p className="sub-title">Questions for the user</p>
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
              disabled={false}
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
                    <div style={{ width: "calc(100% - 40px)" }}>
                      <div
                        className="intdiv mt-0 d-flex align-items-center"
                        style={{ width: "100%" }}
                      >
                        <div>Q: </div>
                        {qEdit[index] ? (
                          <textarea
                            className="int"
                            value={item}
                            rows={2}
                            style={{
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
                      <div
                        className="intdiv mt-1 d-flex align-items-center"
                        style={{ width: "100%" }}
                      >
                        <div>A:</div>
                        {qEdit[index] ? (
                          <textarea
                            className="int"
                            value={demoAnswers[index] ? demoAnswers[index] : ""}
                            rows={2}
                            style={{
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
                        onClick={() => removeQuery(index)}
                      />
                    </div>
                  </div>
                ))}
            </Reorder>
          </div>

          <p className="mt-4 sub-title m-0">Add question</p>
          <div
            className=" p-3"
            style={{
              display: "flex",
              alignItems: "flex-end",
              border: "1px solid #a1d4c6",
              borderRadius: 6
            }}
          >
            <div style={{ width: "calc(100% - 40px)" }}>
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
            </div>
            <div
              style={{
                width: "30px",
                height: "30px",
                cursor: "pointer",
                marginLeft: "10px",
                paddingBottom: "35px"
              }}
              onClick={() => addQuery()}
            >
              <FaSave size={30} color="#20c997" />
            </div>
          </div>
        </div>
        <div style={{ marginLeft: 15, width: "calc(60% - 2px)" }}>
          <div className="d-md-flex align-items-center">
            <p className="sub-title m-0">Prompt</p>
            <FormSelect
              className="mx-md-4 py-1 mt-1"
              style={{
                width: 150,
                fontFamily: "Muli-Regular",
                fontSize: 13,
                background: "transparent",
                color: "#567a73"
              }}
              onChange={(e) => {
                if (e.target.value === "basic") {
                  setAdvanced(false);
                } else {
                  setAdvanced(true);
                }
              }}
              value={advanced ? "advanced" : "basic"}
            >
              <option value="basic">Basic</option>
              <option value="advanced">Advanced</option>
            </FormSelect>
            {!advanced && (
              <div>
                <OverlayTrigger
                  rootClose
                  placement="bottom"
                  overlay={
                    <Popover>
                      <Popover.Body style={{ fontFamily: "Muli-Regular" }}>
                        The Basic version takes your inputs below and creates a
                        response from the AI.
                      </Popover.Body>
                    </Popover>
                  }
                >
                  <button className="border-0 bg-transparent">
                    <BsExclamationCircle color="#567a73" />
                  </button>
                </OverlayTrigger>
              </div>
            )}
          </div>

          {advanced ? (
            <>
              <div className="mt-2">
                <div className="intdiv">
                  <p className="lable" style={{ position: "relative" }}>
                    Context Prompt
                    <span>*</span>
                    <OverlayTrigger
                      rootClose
                      placement="bottom"
                      overlay={
                        <Popover>
                          <Popover.Body style={{ fontFamily: "Muli-Regular" }}>
                            The Context Prompt sets the character and voice of
                            the AI. For example, the Context Prompt can be "Your
                            name is CoachAI and your purpose is to help coach
                            people in their lives.
                          </Popover.Body>
                        </Popover>
                      }
                    >
                      <button className="mx-2 border-0 bg-transparent">
                        <BsExclamationCircle color="#567a73" />
                      </button>
                    </OverlayTrigger>
                  </p>
                  <div className="m-1">
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
                  <textarea
                    id="smsg"
                    className="int"
                    value={systemMsg}
                    rows={4}
                    onChange={(e) => {
                      forcusElement(e);
                      setSystemMsg(e.target.value);
                    }}
                  ></textarea>
                </div>
              </div>
              <div className="mt-2">
                <div className="intdiv">
                  <p className="lable">
                    Opening Prompt
                    <span>*</span>
                    <OverlayTrigger
                      rootClose
                      placement="bottom"
                      overlay={
                        <Popover>
                          <Popover.Body style={{ fontFamily: "Muli-Regular" }}>
                            This prompt will generate the first AI response. For
                            example, this can be "Create a 3-step plan for
                            improving my life on a daily basis.
                          </Popover.Body>
                        </Popover>
                      }
                    >
                      <button className="mx-2 border-0 bg-transparent">
                        <BsExclamationCircle color="#567a73" />
                      </button>
                    </OverlayTrigger>
                  </p>
                  <div className="m-1">
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
                  <textarea
                    id="prompt"
                    className="int"
                    value={promptStr}
                    rows={3}
                    onChange={(e) => {
                      forcusElement(e);
                      setPromptStr(e.target.value);
                    }}
                  ></textarea>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-4">
              {basicQA.map((qa: any, index: number) => (
                <div key={index}>
                  <div className="intdiv">
                    <p className="lable">{qa["question"]}</p>
                    <textarea
                      id={`qa${index}`}
                      className="int"
                      value={qa["answer"]}
                      rows={2}
                      onChange={(e) => {
                        forcusElement(e);
                        updateQA(e.target.value, index);
                      }}
                    ></textarea>
                  </div>
                </div>
              ))}
              <div className="mt-4 mb-2 d-flex align-items-center">
                <p className="sub-title m-0">Add section</p>
                <div className="pb-1">
                  <OverlayTrigger
                    rootClose
                    placement="bottom"
                    overlay={
                      <Popover>
                        <Popover.Body style={{ fontFamily: "Muli-Regular" }}>
                          Sections are parts of a page. For example, a blog post
                          might have 3 sections: an intro, overview, and
                          conclusion. Each section is created using a prompt.
                        </Popover.Body>
                      </Popover>
                    }
                  >
                    <button className="border-0 bg-transparent">
                      <BsExclamationCircle color="#567a73" />
                    </button>
                  </OverlayTrigger>
                </div>
              </div>
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
                    placeholder="Section title"
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
                    placeholder="Section prompt"
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
                    paddingBottom: "35px"
                  }}
                  onClick={() => addSection()}
                >
                  <FaSave size={30} color="#20c997" />
                </div>
              </div>
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
                    disabled={false}
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
                              borderRadius: 5
                            }}
                            key={index}
                          >
                            <div
                              className="intdiv mt-0"
                              style={{
                                width: "calc(100% - 70px)",
                                fontFamily: "Muli-Regular",
                                color: "#567a73"
                              }}
                            >
                              <div className="d-md-flex align-items-center">
                                <div style={{ width: 64 }}>Title:</div>
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
                                        setBasicSections(sArr);
                                      }}
                                    ></textarea>
                                  ) : (
                                    item.t
                                  )}
                                </div>
                              </div>
                              <div className="d-md-flex align-items-center">
                                <div style={{ width: 64 }}>Prompt:</div>
                                <div style={{ width: "100%" }}>
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
                                        setBasicSections(sArr);
                                      }}
                                    ></textarea>
                                  ) : (
                                    item.p
                                  )}
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
                                onClick={() => removeSection(index)}
                              />
                            </div>
                          </div>
                        )
                      )}
                  </Reorder>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {err && <p className="err">{err}</p>}
      {success && <p className="success">{success}</p>}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <ButtonEle title="generate" handle={save} />
      </div>
      {loading && (
        <div className="loading">
          <BeatLoader color="#f42f3b" size={12} />
        </div>
      )}
      {props.editPrompt && (
        <div
          className="mt-2"
          style={{
            maxWidth: 1020,
            border: "1px solid #dae8ff",
            boxShadow: "1px 5px 8px rgba(19, 43, 81, 0.04)",
            borderRadius: 12
          }}
        >
          <div className="intdiv px-3" style={{ marginTop: 20 }}>
            <p className="sub-title m-0 px-1">
              <span style={{ color: "#252525" }}>Link:</span>
            </p>
            <UpdateCopyPanel
              value={`${window.location.origin}/survey/${promptId}`}
            />
          </div>
          <PromptChat
            key={chatKey}
            demo={true}
            systemMsg={systemMsg}
            questions={questions}
            answers={demoAnswers}
            promptStr={promptStr}
            userEmail={props.userinfo.email}
            advancedStr={advancedStr}
            promptId={promptId}
            basicQA={basicQA}
            basicSections={basicSections}
          />
        </div>
      )}

      <Modal show={createShow} onHide={toggleCreateShow}>
        <Modal.Header closeButton>
          <Modal.Title>Add Prompt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CopyPanel
            title="Link"
            value={`${window.location.origin}/survey/${promptId}`}
          />
          <div className="mt-4 d-flex align-items-center">
            <ShareSocial url={`${window.location.origin}/survey/${promptId}`} />
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default PromptEdit;
