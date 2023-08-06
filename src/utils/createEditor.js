import React from "react";
import ReactDOM from "react-dom";
import ObjPath from "object-path";
import { parse } from "acorn";
import { generate as generateJs } from "escodegen";
import { transform as babelTransform } from "@babel/standalone";

export function findReactNode(ast) {
  const { body } = ast;

  return body.find((node) => {
    const { type } = node;
    const obj = ObjPath.get(node, "expression.callee.object.name");
    const func = ObjPath.get(node, "expression.callee.property.name");

    return (
      type === "ExpressionStatement" &&
      obj === "React" &&
      func === "createElement"
    );
  });
}

export function createEditor(domElement, moduleResolver = () => null) {
  function render(node) {
    ReactDOM.render(node, domElement);
  }

  function require(moduleName) {
    return moduleResolver(moduleName);
  }

  function getWrapperFunction(code) {
    try {
      const esCode = babelTransform(code, {
        presets: ["es2015", "react"],
      }).code;

      const ast = parse(esCode, {
        sourceType: "module",
      });

      const rnode = findReactNode(ast);

      if (rnode) {
        const nodeIndex = ast.body.indexOf(rnode);
        const createElSrc = generateJs(rnode).slice(0, -1);
        const renderCallAst = parse(`render(${createElSrc})`).body[0];
        ast.body[nodeIndex] = renderCallAst;
      }

      return new Function("React", "render", "require", generateJs(ast));
    } catch ({ message }) {
      render(<pre style={{ color: "red" }}>{message}</pre>);
    }
  }

  return {
    compile(code) {
      return getWrapperFunction(code);
    },
    run(code) {
      this.compile(code)(React, render, require);
    },
    getCompiledCode(code) {
      return getWrapperFunction(code).toString();
    },
  };
}
