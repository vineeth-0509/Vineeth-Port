import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App.jsx";
import Admin from "./Admin.jsx";

const isAdmin = window.location.pathname.replace(/\/$/, "") === "/admin";
if (isAdmin) document.title = "Admin";
createRoot(document.getElementById("root")).render(isAdmin ? <Admin /> : <App />);
