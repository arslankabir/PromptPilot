//@ts-nocheck

import React from "react";
import "./stepProgressBar.css";
import { ProgressBar, Step } from "react-step-progress-bar";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { BsQuestionCircle } from "react-icons/bs";

const MultiStepProgressBar = ({ page, onPageNumberClick }) => {
  var stepPercentage = 0;
  if (page === 1) {
    stepPercentage = 0;
  } else if (page === 2) {
    stepPercentage = 50;
  } else if (page === 3) {
    stepPercentage = 100;
  } else {
    stepPercentage = 0;
  }

  return (
    <ProgressBar percent={stepPercentage}>
      <Step>
        {({ accomplished, index }) => (
          <div
            className={`indexedStep ${
              accomplished ? "accomplished" : null
            } flex`}
            onClick={() => onPageNumberClick("1")}
          >
            <OverlayTrigger
              rootClose
              placement="top"
              overlay={
                <Popover>
                  <Popover.Body style={{ fontFamily: "Muli-Regular" }}>
                    In this section, you will create a survey and apply a prompt
                    to create the Analysis.
                  </Popover.Body>
                </Popover>
              }
            >
              <div className="flex pr-2">
                Assessment <BsQuestionCircle color="#ffffff" size={10} />
              </div>
            </OverlayTrigger>
          </div>
        )}
      </Step>
      <Step>
        {({ accomplished, index }) => (
          <div
            className={`indexedStep ${accomplished ? "accomplished" : null}`}
            onClick={() => onPageNumberClick("2")}
          >
            <OverlayTrigger
              rootClose
              placement="top"
              overlay={
                <Popover>
                  <Popover.Body style={{ fontFamily: "Muli-Regular" }}>
                    In this section, you will use the Analysis to create report
                    sections.
                  </Popover.Body>
                </Popover>
              }
            >
              <div>
                Analysis{" "}
                <BsQuestionCircle
                  color={accomplished ? "ffffff" : "#567a73"}
                  size={10}
                />
              </div>
            </OverlayTrigger>
          </div>
        )}
      </Step>
      <Step>
        {({ accomplished, index }) => (
          <div
            className={`indexedStep ${accomplished ? "accomplished" : null}`}
            onClick={() => onPageNumberClick("3")}
          >
            <OverlayTrigger
              rootClose
              placement="top"
              overlay={
                <Popover>
                  <Popover.Body style={{ fontFamily: "Muli-Regular" }}>
                    In this section, you will review and edit the Report
                    created.
                  </Popover.Body>
                </Popover>
              }
            >
              <div>
                Report{" "}
                <BsQuestionCircle
                  color={accomplished ? "ffffff" : "#567a73"}
                  size={10}
                />
              </div>
            </OverlayTrigger>
          </div>
        )}
      </Step>
    </ProgressBar>
  );
};

export default MultiStepProgressBar;
