//@ts-nocheck
import React, { useState, useEffect } from "react";

import "bootstrap/dist/css/bootstrap.min.css";

import BTable from "react-bootstrap/Table";
import { Modal, Table, Tabs, Tab } from "react-bootstrap";

import { useTable, useSortBy, usePagination } from "react-table";
import { PaginationControl } from "react-bootstrap-pagination-control";
import {
  BsFillArrowUpCircleFill,
  BsFillArrowDownCircleFill
} from "react-icons/bs";
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";
import TextField from "./textField";
import ButtonEle from "./buttonEle";
import { BeatLoader } from "react-spinners";
import { listMessages, updateReferral } from "../api/post";

function RTable(props: any) {
  const [referralShow, setReferralShow] = useState(false);
  const [ambassadorShow, setAmbassadorShow] = useState(false);
  const [selectedReferrals, setSelectedReferrals] = useState<any>([]);
  const [selectedReferralsOffset, setSelectedReferralsOffset] = useState(0);
  const [ambassadorData, setAmbassadorData] = useState(null);
  const [emails, setEmails] = useState([]);

  const [key, setKey] = useState("referrals");

  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  let {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize }
  } = useTable(
    {
      columns: props.columns,
      data: props.data
    },
    useSortBy,
    usePagination
  );

  const handle = async (value: string) => {
    setKey("referrals");
    setSelectedReferrals([]);
    setEmails([]);

    // let selectedArr = [];
    const data = props.referralData;
    const arr = data.filter((item) => item.hashedReferral === value);
    if (arr.length > 0) {
      arr.sort((a, b) => {
        let da = new Date(a.date.split(".")[0]).getTime();
        let db = new Date(b.date.split(".")[0]).getTime();

        return db - da;
      });
      // for (let k = 0; k < arr.length; k++) {
      //   const ext = selectedArr.filter((i) => i.email === arr[k].email);
      //   if (ext.length === 0) {
      //     selectedArr.push(arr[k]);
      //   }
      // }
      setSelectedReferrals(arr);
    }
    // setSelectedReferrals(selectedArr);
    setReferralShow(true);

    setLoading(true);
    const ambassadorList = props.data;
    const selectedAmbassador = ambassadorList.find(
      (item) => item.hashedReferrer === value
    );
    if (selectedAmbassador) {
      const messages = await listMessages({ email: selectedAmbassador.email });
      if (messages.data && messages.data.messages) {
        setEmails(messages.data.messages);
      }
    }
    setLoading(false);
  };

  const editField = (param: any) => {
    setErr("");
    setSuccess("");
    const ambassador = props.data.find(
      (item: any) =>
        item.email === param.email && item.hashedReferrer === param.code
    );
    if (ambassador) {
      setAmbassadorData(ambassador);
      setAmbassadorShow(true);
    }
  };

  const submit = async () => {
    if (!ambassadorData.email) {
      setErr("Please type email address");
      return;
    }
    const extArr = props.data.filter(
      (item: any) =>
        item.email === ambassadorData.email &&
        item.hashedReferrer !== ambassadorData.hashedReferrer
    );
    if (extArr.length > 0) {
      setErr("The ambassador with this email already exist");
      return;
    }

    setLoading(true);
    const res = await updateReferral(ambassadorData);
    if (res.data.success) {
      let updatedArr = props.data.filter(
        (item: any) => item.id !== ambassadorData.id
      );
      updatedArr.push(ambassadorData);
      updatedArr.sort((a, b) => {
        let da = new Date(a.date.split(".")[0]).getTime();
        let db = new Date(b.date.split(".")[0]).getTime();

        return db - da;
      });

      props.setData(updatedArr);
      setSuccess("Updated successfully");
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="table-wrapper">
        <div className="table-scroll">
          <BTable responsive className="campaign-table" {...getTableProps()}>
            <thead>
              {headerGroups.map((headerGroup: any) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column: any) => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                    >
                      {column.render("Header")}
                      <span>
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            <BsFillArrowDownCircleFill
                              size={15}
                              color={"#666f78"}
                              className="ml-2"
                              style={{
                                position: "relative",
                                top: "-2px",
                                left: 10
                              }}
                            />
                          ) : (
                            <BsFillArrowUpCircleFill
                              size={15}
                              color={"#666f78"}
                              className="ml-2"
                              style={{
                                position: "relative",
                                top: "-2px",
                                left: 10
                              }}
                            />
                          )
                        ) : (
                          ""
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.map((row: any, i: number) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell: any) => {
                      return (
                        <td
                          {...cell.getCellProps()}
                          onClick={() => {
                            if (
                              cell.column.Header !== "Action" &&
                              cell.row.cells.length > 2 &&
                              cell.row.cells[2].column.Header ===
                                "Referral code"
                            ) {
                              handle(cell.row.cells[2].value);
                            } else if (cell.column.Header === "Action") {
                              editField({
                                email: cell.row.cells[0].value,
                                name: cell.row.cells[1].value,
                                code: cell.row.cells[2].value
                              });
                            }
                          }}
                        >
                          {cell.column.Header === "Date"
                            ? cell.value.replace(/\//g, "-")
                            : cell.render("Cell")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </BTable>
        </div>
      </div>
      <div className="display d-lg-flex w-100 overflow-auto">
        <div className="d-flex align-items-center my-2">
          <div>
            Displaying <span className="colored">{page.length}</span> out of{" "}
            <span className="colored">{props.data.length}</span> | Displaying
            Per Row
          </div>
          <div>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="my-2" style={{ width: "max-content" }}>
          <PaginationControl
            page={pageIndex + 1}
            between={4}
            total={props.data.length}
            limit={pageSize}
            changePage={(page: number) => {
              gotoPage(page - 1);
            }}
            ellipsis={1}
          />
        </div>
      </div>
      <Modal show={referralShow} onHide={() => setReferralShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {key === "referrals" ? "Referrals" : "Emails"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs
            activeKey={key}
            onSelect={(k) => {
              if (k) setKey(k);
            }}
            id="data-tab"
            className="mb-3"
          >
            <Tab eventKey="referrals" title="Referrals">
              <p className="d-flex justify-content-between align-items-center">
                <div>
                  {selectedReferralsOffset > 0 && (
                    <FaArrowAltCircleLeft
                      onClick={() =>
                        setSelectedReferralsOffset(selectedReferralsOffset - 30)
                      }
                      className="mx-1"
                      style={{ cursor: "pointer" }}
                    />
                  )}
                  {selectedReferralsOffset + 30 < selectedReferrals.length && (
                    <FaArrowAltCircleRight
                      onClick={() =>
                        setSelectedReferralsOffset(selectedReferralsOffset + 30)
                      }
                      className="mx-1"
                      style={{ cursor: "pointer" }}
                    />
                  )}
                </div>
                <div>Total: {selectedReferrals.length}</div>
              </p>
              <Table className="campaign-table">
                <thead>
                  <tr>
                    <td>Email</td>
                    <td>Name</td>
                    <td>Date</td>
                  </tr>
                </thead>
                <tbody>
                  {selectedReferrals
                    .slice(
                      selectedReferralsOffset,
                      selectedReferralsOffset + 30
                    )
                    .map((item: any, i: number) => (
                      <tr key={i}>
                        <td>{item.email}</td>
                        <td>{item.name}</td>
                        <td>{item.date.replace(/\//g, "-")}</td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </Tab>
            <Tab eventKey="emails" title="Email history">
              {loading && (
                <div className="loading" style={{ textAlign: "left" }}>
                  <BeatLoader color="#f42f3b" size={12} />
                </div>
              )}
              <Table className="campaign-table">
                <thead>
                  <tr>
                    <td>Subject</td>
                    <td>Status</td>
                    <td>Last event received</td>
                    <td>Opens</td>
                  </tr>
                </thead>
                <tbody>
                  {emails.map((item: any, i: number) => (
                    <tr key={i}>
                      <td>{item.subject}</td>
                      <td>{item.status}</td>
                      <td>
                        {(
                          "0" +
                          (new Date(item.last_event_time).getMonth() + 1)
                        ).substr(-2) +
                          "-" +
                          new Date(item.last_event_time).getDate() +
                          "-" +
                          new Date(item.last_event_time).getFullYear() +
                          " " +
                          (
                            "0" + new Date(item.last_event_time).getHours()
                          ).substr(-2) +
                          ":" +
                          (
                            "0" + new Date(item.last_event_time).getMinutes()
                          ).substr(-2) +
                          "." +
                          (
                            "0" + new Date(item.last_event_time).getSeconds()
                          ).substr(-2)}
                      </td>
                      <td>{item.opens_count}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Tab>
          </Tabs>
        </Modal.Body>
      </Modal>
      <Modal show={ambassadorShow} onHide={() => setAmbassadorShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ambassador</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <TextField
            title="Email"
            placeholder=""
            required={true}
            value={ambassadorData?.email}
            setValue={(value: string) => {
              setErr("");
              setAmbassadorData({ ...ambassadorData, email: value });
            }}
            err={err}
          />
          <TextField
            title="Name"
            placeholder=""
            required={false}
            value={ambassadorData?.name}
            setValue={(value: string) =>
              setAmbassadorData({ ...ambassadorData, name: value })
            }
          />
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <ButtonEle title="Save" handle={submit} />
          </div>
          {success && <p className="success">{success}</p>}
          {loading && (
            <div className="loading">
              <BeatLoader color="#f42f3b" size={12} />
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default RTable;
