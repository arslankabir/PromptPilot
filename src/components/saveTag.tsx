import React, { useState, useEffect, useRef } from "react";
import { saveTagInKeap, saveTags } from "../api/post";
import { BeatLoader } from "react-spinners";
import { oneClientByHashedReferrer } from "../api/post";
import { BiSave } from "react-icons/bi";
import { Button, Table, OverlayTrigger, Tooltip } from "react-bootstrap";
import { BsPlusCircle, BsX, BsExclamationCircle } from "react-icons/bs";

function SaveTag(props: any) {
  const target = useRef(null);

  const [campaignid, setCampaignid] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<
    {
      category: {
        id: number;
        description: string;
        name: string;
      };
      description: string;
      name: string;
      id: number;
    }[]
  >([]);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [updateIndex, setUpdateIndex] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  var index = 0;

  useEffect(() => {
    const getClient = async () => {
      index++;
      setErr("");
      setSuccess("");

      setLoading(true);
      const res = await oneClientByHashedReferrer({
        hashedReferrer: props.campaignHashedReferrer
      });
      if (res.data) {
        if (res.data.Item && res.data.Item.id) {
          setCampaignid(res.data.Item.id.S);
          if (res.data.Item.tags && res.data.Item.tags.S) {
            setTags(JSON.parse(res.data.Item.tags.S));
          }
        } else {
          setErr(res.data.err?.message);
        }
      } else {
        setErr(res.err);
      }

      setLoading(false);
    };

    if (index === 0 && props.campaignHashedReferrer) getClient();
  }, [JSON.stringify(props)]);

  const save = async (event: any) => {
    event?.preventDefault();

    setErr("");
    setSuccess("");

    if (!campaignid) return;

    let tagsArr = tags;
    if (name) {
      tagsArr.push({
        category: {
          id: 123,
          name: "ct: reinvent",
          description: "reinvent"
        },
        name,
        description,
        id: 0
      });
    }

    setLoading(true);
    let updatedArr = [];
    for (let k = 0; k < tagsArr.length; k++) {
      if (tagsArr[k].id === 0) {
        const resKeap = await saveTagInKeap({
          data: JSON.stringify({
            category: {
              id: 123
            },
            description: tagsArr[k].description,
            name: tagsArr[k].name
          })
        });

        if (resKeap.data && resKeap.data.id) {
          tagsArr[k].id = resKeap.data.id;
          updatedArr.push(tagsArr[k]);
        } else {
          setErr("Can not create an object with duplicate Tag Name");
        }
      } else {
        updatedArr.push(tagsArr[k]);
      }
    }
    const res: any = await saveTags({
      campaignid: campaignid,
      tags: JSON.stringify(updatedArr)
    });

    if (res.data) {
      if (res.data.success) {
        setTags(updatedArr);
        setName("");
        setDescription("");
        setSuccess("Tags saved successfully");
      } else {
        setErr(res.data.err?.message);
      }
    } else {
      setErr(res.err?.message);
    }
    setLoading(false);
  };

  const addTag = () => {
    if (!name) {
      setErr("Please insert name of tag!");
      return;
    }

    setTags((current) => [
      ...current,
      {
        category: {
          id: 123,
          name: "ct: reinvent",
          description: "reinvent"
        },
        name,
        description,
        id: 0
      }
    ]);
    setName("");
    setDescription("");
  };

  const removeTag = (index: number) => {
    let arr = [];
    for (let i = 0; i < tags.length; i++) {
      if (i !== index) arr.push(tags[i]);
    }
    setTags(arr);
  };

  useEffect(() => {
    setTimeout(() => {
      setSuccess("");
      setErr("");
    }, 3000);
  }, [success, err]);

  return (
    <>
      <Table responsive className="reward-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tags.map(
            (
              item: {
                name: string;
                description: string;
              },
              index: number
            ) => (
              <tr key={index} className="data-row">
                <td>
                  <span className="px-1">{item.name}</span>
                </td>
                <td>
                  <span className="px-3">{item.description}</span>
                </td>
                <td>
                  <BsX
                    size={20}
                    className="mx-2"
                    onClick={() => removeTag(index)}
                  />
                </td>
              </tr>
            )
          )}
          <tr className="data-row">
            <td>
              <div className="intdiv mt-0">
                <input
                  className="int mt-0"
                  placeholder="name of tag"
                  value={name}
                  onChange={(e) => {
                    setErr("");
                    setSuccess("");
                    setName(e.target.value);
                  }}
                />
              </div>
            </td>
            <td>
              <div className="intdiv mt-0">
                <input
                  className="int mt-0"
                  placeholder="description"
                  value={description}
                  type="text"
                  onChange={(e) => {
                    setErr("");
                    setSuccess("");
                    setDescription(e.target.value);
                  }}
                />
              </div>
            </td>
            <td>
              <BsPlusCircle size={16} onClick={() => addTag()} />
            </td>
          </tr>
        </tbody>
      </Table>
      {err && <p className="err">{err}</p>}
      {success && <p className="success">{success}</p>}
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <Button className="btn-ele" onClick={save} style={{ width: 180 }}>
          <BiSave className="mx-1" /> Save
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

export default SaveTag;
