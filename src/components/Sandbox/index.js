import React, { useState, useEffect, useRef } from "react";
import _debounce from "lodash/debounce";
import { createEditor } from "../../utils/createEditor";

function SandBox() {
  const viewRef = useRef(null);
  const runtimeRef = useRef(null);
  const [code, setCode] = useState(`
    function MyCom() {
      return <span>Let's type some jsx!!</span>
    }

    <MyCom />
  `);

  useEffect(() => {
    runtimeRef.current = createEditor(viewRef.current);
    runtimeRef.current.run(code);
  }, []);

  const run = _debounce((newCode) => {
    runtimeRef.current.run(newCode || code);
  }, 500);

  const onCodeChange = ({ target: { value } }) => {
    setCode(value);
    run(value);
  };

  return (
    <div className="container" style={{ display: "flex" }}>
      <div className="code-editor" style={{ flex: 1 }}>
        <textarea value={code} onChange={onCodeChange} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="preview" ref={viewRef} />
      </div>
    </div>
  );
}

export default SandBox;
