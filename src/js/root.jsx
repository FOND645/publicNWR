import React, { useEffect } from "react";
import { App, Button, Image, Layout, Menu } from "antd";
import * as ReactDOM from "react-dom/client";

import { Provider } from "react-redux";
import {  store } from "./storage/reducer";

import Logo from "../img/logo.png";
import { MainMenu } from "./components/root/MainMenu.jsx";
import { Repair } from "./pages/Repair.jsx";
import { UnitContracts } from "./pages/UnitContracts.jsx";
import { DevicesBaseEditor } from "./pages/DevicesBaseEditor.jsx";
import { DefectsBaseEditor } from "./pages/DefectsBaseEditor.jsx";
import ContractsSettings from "./pages/ContractsSettings.jsx";
import AppSettings from "./pages/AppSettings.jsx";
import { MaterialsEditor } from "./pages/MaterialsEditor.jsx";

import "../css/root.css";
import { isObject } from "lodash";

const { Sider, Content } = Layout;

function Root(props) {
    console.log("Начинаю рендерить Root");
    let contentRef;
    let firstRender = true;

    function menuClickHandler(event) {
        console.log(event)
        let NewContent;
        const { content } = event;
        if (isObject(content)) {
            const { type, key } = content;
            switch (type) {
                case "Repair":
                    NewContent = <Repair contractKey={key} />;
                    break;
                default:
                    return;
            }
        } else {
            switch (content) {
                case "UnitContracts":
                    NewContent = <UnitContracts />;
                    break;
                case "DefectsBaseEditor":
                    NewContent = <DefectsBaseEditor />;
                    break;
                case "DevicesBaseEditor":
                    NewContent = <DevicesBaseEditor />;
                    break;
                case "ContractsSettings":
                    NewContent = <ContractsSettings />;
                    break;
                case "AppSettings":
                    NewContent = <AppSettings />;
                    break;
                case "MaterialsEditor":
                    NewContent = <MaterialsEditor />;
                    break;
                default:
                    return;
            }
        }
        console.log(NewContent);

        // Листнер для монтирования нового компонента
        const unmountListner = () => {
            contentRef.render(<Provider store={store}>{NewContent}</Provider>);
            document.removeEventListener("component_unmounted", unmountListner);
        };

        if (firstRender) {
            contentRef.render(<Provider store={store}>{NewContent}</Provider>);
            firstRender = false;
        } else {
            document.addEventListener("component_unmounted", unmountListner);
            contentRef.render(<div />);
        }

        return;
    }

    useEffect(() => {
        contentRef = ReactDOM.createRoot(document.getElementById("content"));

        document.addEventListener("menu_clicked", menuClickHandler);
        return () => {
            document.removeEventListener("menu_clicked", menuClickHandler);
        };
    }, []);

    return (
        <Provider store={store}>
            <Layout>
                <Sider style={{ backgroundColor: "rgba(168,211,255,105)" }}>
                    <Image src={Logo} preview={false} style={{ width: "100%", padding: "5%" }} />
                    <MainMenu />
                </Sider>

                <Content id="content"></Content>
            </Layout>
        </Provider>
    );
}

export default Root;
