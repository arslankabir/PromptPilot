import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/layout";
import {
  getChatContentByEmail,
  getChatContentByPrompt,
  getPromptById,
} from "../api/post";
import { BeatLoader } from "react-spinners";
import { Table, Pagination } from "react-bootstrap";

interface IDataObj {
  email: string;
  chat: { prompt: string; answers: string[][]; data: IChatObj[] };
}

interface IChatObj {
  owner: string;
  mention: string;
}

function ChatHistory(props: any) {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedChat, setSelectedChat] = useState<IChatObj[]>([]);
  const [data, setData] = useState<IDataObj[]>([]);
  const [err, setErr] = useState("");
  const [userChat, setUserChat] = useState<IChatObj[]>([]);
  const [answers, setAnswers] = useState<string[][]>([]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState<number>(10);
  const [offset, setOffset] = useState(0);
  const [pages, setPages] = useState(0);
  const [current, setCurrent] = useState(1);
  const [showData, setShowData] = useState<IDataObj[]>([]);

  const params = useParams();

  var index = 0;

  useEffect(() => {
    const getData = async () => {
      index++;
      setErr("");

      setLoading(true);
      if (params.id) {
        const result = await getChatContentByPrompt({ promptId: params.id });
        if (result.data) {
          setData(result.data);
        }
        const prompt = await getPromptById({ id: params.id });
        if (prompt.data) {
          setQuestions(
            prompt.data.Item.questions.S
              ? JSON.parse(prompt.data.Item.questions.S)
              : []
          );
        }
      } else {
        const result = await getChatContentByEmail({
          email: props.userinfo.email,
        });
        if (
          result.data &&
          result.data.Item &&
          result.data.Item.chat &&
          result.data.Item.chat.S
        ) {
          let arr: IChatObj[] = [];
          const chatObjArr = JSON.parse(result.data.Item.chat.S);
          for (let i = 0; i < chatObjArr.length; i++) {
            arr = arr.concat(chatObjArr[i].data);
          }
          setUserChat(arr);
        }
      }

      setLoading(false);
    };

    if (index === 0) getData();
  }, [JSON.stringify(params)]);

  useEffect(() => {
    if (data.length > 0) {
      setShowData(data.slice(offset, offset + step));
      setPages(Math.ceil(data.length / step));
    }
  }, [data.length, step, offset]);

  useEffect(() => {
    setOffset((current - 1) * step);
  }, [current]);

  useEffect(() => {
    if (showData.length === 0 && current > 1) {
      setCurrent(1);
    }
  }, [showData]);

  useEffect(() => {
    if (selectedUser) {
      const selected = data.find(
        (item: IDataObj) => item.email === selectedUser
      );
      if (selected) {
        setSelectedChat(selected.chat.data);
        setAnswers(selected.chat.answers);
      }
    }
  }, [selectedUser]);

  const paginate = (param: string) => {
    if (param === "next") {
      if (current < pages) setCurrent(current + 1);
    } else if (param === "prev") {
      if (current > 1) setCurrent(current - 1);
    } else {
      setCurrent(parseInt(param));
    }
  };

  return (
    <Layout userinfo={props.userinfo}>
      <div className="sub-container">
        <div className="content">
          <h2 className="title" style={{ marginBottom: 20 }}>
            chats
          </h2>
          {params.id ? (
            <div className="edit-content">
              <div style={{ width: "40%" }}>
                <p className="sub-title">Users</p>

                <div className="mt-4">
                  {data.length > 0 && (
                    <div>
                      <Table responsive className="campaign-table">
                        <thead>
                          <tr>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((item: IDataObj, index: number) => (
                            <tr
                              key={index}
                              style={{ cursor: "pointer" }}
                              onClick={() => setSelectedUser(item.email)}
                            >
                              <td
                                style={{
                                  color:
                                    item.email === selectedUser
                                      ? "#20c895"
                                      : "inherit",
                                }}
                              >
                                {item.email}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                      <div className="display d-lg-flex align-items-lg-center">
                        <div className="d-flex align-items-center my-2">
                          <div>
                            Displaying{" "}
                            <span className="colored">{showData.length}</span>{" "}
                            out of{" "}
                            <span className="colored">{data.length}</span> |
                            Displaying Per Row
                          </div>
                          <div>
                            <select
                              value={step}
                              onChange={(e) =>
                                setStep(parseInt(e.target.value))
                              }
                            >
                              <option value={10}>10</option>
                              <option value={20}>20</option>
                              <option value={30}>30</option>
                            </select>
                          </div>
                        </div>
                        <div className="my-2" style={{ width: "max-content" }}>
                          <Pagination className="m-0">
                            <Pagination.Item onClick={() => paginate("prev")}>
                              {"<"}
                            </Pagination.Item>
                            {Array(pages)
                              .fill(1)
                              .map((items: any, index: number) => (
                                <Pagination.Item
                                  key={index}
                                  active={current === index + 1}
                                  onClick={() =>
                                    paginate((index + 1).toString())
                                  }
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
                </div>
              </div>
              <div style={{ marginLeft: "2%", width: "58%" }}>
                <Table responsive className="campaign-table">
                  <thead>
                    <tr>
                      {questions.map((item: string, index: number) => (
                        <th key={index}>{item}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {answers.map((item: string[], index: number) => (
                      <tr key={index}>
                        {item.map((ans: string, i: number) => (
                          <td key={i}>{ans}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <p className="sub-title">Chat</p>
                <div>
                  <div className="chat-zone">
                    <div className="chat-content">
                      {selectedChat.map((cht: IChatObj, index: number) => (
                        <div
                          className={`chat-item ${
                            cht.owner === "you" ? "ymsg" : "cmsg"
                          }`}
                          key={index}
                        >
                          <div className="mentioned">{cht.mention}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="chat-container"
              style={{ border: "1px solid #dae8ff" }}
            >
              <div className="chat-zone">
                <div className="chat-content">
                  {userChat.map((cht: IChatObj, index: number) => (
                    <div
                      className={`chat-item ${
                        cht.owner === "you" ? "ymsg" : "cmsg"
                      }`}
                      key={index}
                    >
                      <div className="mentioned">{cht.mention}</div>
                    </div>
                  ))}
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
        </div>
      </div>
    </Layout>
  );
}

export default ChatHistory;
