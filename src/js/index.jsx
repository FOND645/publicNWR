import React from "react";
import * as ReactDOM from "react-dom/client";
import Root from "./root.jsx";
import { Provider } from "react-redux";

import "../css/index.css";

import { store } from "./storage/reducer.js";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <Provider store={store}>
        <Root />
    </Provider>
);
