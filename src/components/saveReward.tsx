import React, { useState, useEffect, useRef } from "react";
import {
  retrieveTagsInKeap,
  saveMessage,
  saveReward,
  saveTagInKeap
} from "../api/post";
import { BeatLoader } from "react-spinners";
import { oneClientByHashedReferrer } from "../api/post";
import { BiSave } from "react-icons/bi";
import { Button, Table, OverlayTrigger, Tooltip, Modal } from "react-bootstrap";
import {
  BsPlusCircle,
  BsX,
  BsExclamationCircle,
  BsEnvelopeFill
} from "react-icons/bs";

function SaveReward(props: any) {
  const target = useRef(null);

  const [campaignid, setCampaignid] = useState("");
  const [name, setName] = useState("");
  const [reward, setReward] = useState("");
  const [subreferrals, setSubReferrals] = useState<any>("");
  const [rewards, setRewards] = useState<
    { tagId: string; name: string; subreferrals: number; code: string }[]
  >([]);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [updateIndex, setUpdateIndex] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
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
          if (res.data.Item.reward && res.data.Item.reward.S) {
            setRewards(JSON.parse(res.data.Item.reward.S));
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

    let rewardArr = rewards;
    if (name && subreferrals) {
      rewardArr.push({ tagId: "", name, subreferrals, code: reward });
    }
    if (rewardArr.length === 0) {
      setErr("Please insert rewards!");
      return;
    }

    setLoading(true);
    for (let k = 0; k < rewardArr.length; k++) {
      const resKeap = await saveTagInKeap({
        data: JSON.stringify({
          category: {
            id: 123
          },
          description: rewardArr[k].name,
          name: rewardArr[k].name
        })
      });

      if (resKeap.data && resKeap.data.id) {
        rewardArr[k].tagId = resKeap.data.id;
      } else {
        const extTags = await retrieveTagsInKeap({
          tagName: rewardArr[k].name
        });
        if (extTags.data && extTags.data.tags && extTags.data.tags.length > 0) {
          rewardArr[k].tagId = extTags.data.tags[0].id;
        }
      }
    }

    const res: any = await saveReward({
      campaignid: campaignid,
      reward: JSON.stringify(rewardArr)
    });

    if (res.data) {
      if (res.data.success) {
        setRewards(rewardArr);
        setName("");
        setReward("");
        setSubReferrals("");
        setSuccess("Reward saved successfully");
      } else {
        setErr(res.data.err?.message);
      }
    } else {
      setErr(res.err?.message);
    }
    setLoading(false);
  };

  const addReward = () => {
    if (!name) {
      setErr("Please insert name of reward!");
      return;
    }

    if (!subreferrals) {
      setErr("Please insert number of sub-referrals!");
      return;
    }

    // if (!reward) {
    //   setErr("Please insert reward!");
    //   return;
    // }

    setRewards((current) => [
      ...current,
      { tagId: "", name, subreferrals, code: reward }
    ]);
    setName("");
    setReward("");
    setSubReferrals("");
  };

  const removeReward = (index: number) => {
    let arr = [];
    for (let i = 0; i < rewards.length; i++) {
      if (i !== index) arr.push(rewards[i]);
    }
    setRewards(arr);
  };

  const saveMsg = async (event: any) => {
    event?.preventDefault();

    setErr("");
    setSuccess("");

    let rewardArr: any = rewards;
    if (updateIndex === null) return;

    rewardArr[updateIndex]["msg"] = msg;

    setLoading(true);
    const res: any = await saveReward({
      campaignid: campaignid,
      reward: JSON.stringify(rewardArr)
    });

    if (res.data) {
      if (res.data.success) {
        setRewards(rewardArr);
        setName("");
        setReward("");
        setSubReferrals("");
        setOpen(false);
        setMsg("");
        setUpdateIndex(null);
      } else {
        setErr(res.data.err?.message);
      }
    } else {
      setErr(res.err?.message);
    }
    setLoading(false);
  };

  return (
    <>
      <Table responsive className="reward-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Referrals&nbsp;needed&nbsp;to&nbsp;earn&nbsp;rewards</th>
            {/*
            <th>
              <div className="d-flex">
                <div>Reward&nbsp;Promo&nbsp;Code</div>
                <div className="px-2">
                  <OverlayTrigger
                    placement="bottom"
                    overlay={
                      <Tooltip>
                        Referrer will receive this promo code if they sign up
                        the number of sub-referrals in the rewards table.
                      </Tooltip>
                    }
                  >
                    {({ ref, ...triggerHandler }) => (
                      <div
                        style={{ cursor: "pointer" }}
                        {...triggerHandler}
                        ref={ref}
                      >
                        <BsExclamationCircle />
                      </div>
                    )}
                  </OverlayTrigger>
                </div>
              </div>
            </th>
            */}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rewards.map(
            (
              item: {
                name: string;
                subreferrals: number;
                code: string;
                msg?: string;
              },
              index: number
            ) => (
              <tr key={index} className="data-row">
                <td>
                  <span className="px-1">{item.name}</span>
                </td>
                <td>
                  <span className="px-3">{item.subreferrals}</span>
                </td>
                {/*
                <td>
                  <span className="px-3">{item.code}</span>
                </td>
                */}
                <td>
                  <BsEnvelopeFill
                    size={15}
                    onClick={() => {
                      setUpdateIndex(index);
                      setMsg(item.msg ? item.msg : "");
                      setOpen(true);
                    }}
                  />
                  <BsX
                    size={20}
                    className="mx-2"
                    onClick={() => removeReward(index)}
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
                  placeholder="name of reward"
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
                  placeholder="number of sub-referrals"
                  value={subreferrals}
                  type="number"
                  onChange={(e) => {
                    setErr("");
                    setSuccess("");
                    setSubReferrals(e.target.value);
                  }}
                />
              </div>
            </td>
            {/*
            <td>
              <div className="intdiv mt-0">
                <input
                  className="int mt-0"
                  placeholder="reward (promotion code)"
                  value={reward}
                  type="text"
                  onChange={(e) => {
                    setErr("");
                    setSuccess("");
                    setReward(e.target.value);
                  }}
                />
              </div>
            </td>
            */}
            <td>
              <BsPlusCircle size={16} onClick={() => addReward()} />
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
      <Modal show={open} onHide={() => setOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Email</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="intdiv">
            <textarea
              className="int"
              rows={5}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
            ></textarea>
            <div className="text-center">
              <Button
                className="btn-ele"
                onClick={saveMsg}
                style={{ width: 180 }}
              >
                <BiSave className="mx-1" /> Save
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default SaveReward;
