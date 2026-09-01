import React from "react";
import { createRoot } from "react-dom/client";
import AuctionDraftBoard from "./auction-draft-board.jsx";

window.storage ||= {
  get: async key => {
    const value = localStorage.getItem(key);
    return value == null ? null : { key, value };
  },
  set: async (key, value) => {
    localStorage.setItem(key, value);
    return { key, value };
  },
  delete: async key => {
    localStorage.removeItem(key);
    return { key, deleted: true };
  },
};

createRoot(document.getElementById("root")).render(<AuctionDraftBoard />);
