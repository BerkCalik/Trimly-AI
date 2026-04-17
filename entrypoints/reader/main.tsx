import { createRoot } from "react-dom/client";

import "./style.css";

import { App } from "./App";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Missing #root mount node for reader");
}

createRoot(container).render(<App />);
