import React, { useState } from "react";

import "./DropArea.css";

function DropArea({ newList, onDrop, place }) {
  const [show, setshow] = useState(false);

  const drop = () => {
    setshow(false);
    onDrop(newList, place);
  };

  return (
    <div
      className={show ? "drop-area show" : "drop-area"}
      onDragEnter={() => setshow(true)}
      onDragLeave={() => setshow(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={drop}
    >
      Drop Here
    </div>
  );
}

export default DropArea;
