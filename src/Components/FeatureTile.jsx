import React from "react";

function FeatureTile({ item, key }) {
  return (
    <li className="links-06__article bg-white" key={key}>
      <div className="links-06__logo">{item.icon}</div>
      <h3 className="links-06__title">{item.heading}</h3>
      <div className="links-06__text">{item.content}</div>
      <div className="links-06__link link feature__button_box" />
    </li>
  );
}

export default FeatureTile;
