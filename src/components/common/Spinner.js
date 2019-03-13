import React from "react";
import spinner from "./spinner3.gif";

export default () => {
  return (
    <div>
      <img
        src={spinner}
        style={{ width: "300px", margin: "auto", display: "block" }}
        alt="Loading..."
      />
    </div>
  );
};
