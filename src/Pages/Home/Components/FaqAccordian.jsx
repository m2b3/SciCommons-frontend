import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function FaqAccordian({faq, index}) {
  return (
    <Accordion
      className="faq-01__question js-open-faq color-main border-2 border-green-500"
      style={{
        border: "2px solid #10b981",
        borderRadius: "5px",
      }}
      key={index}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
        className="faq-01__question_text text-green-500"
        style={{ color: "#10b981" }}
      >
        {faq.ques}
      </AccordionSummary>
      <AccordionDetails
        className="faq-01__answer_text"
        style={{ fontWeight: "400", color: "black" }}
      >
        {faq.ans}
      </AccordionDetails>
    </Accordion>
  );
}

export default FaqAccordian;
