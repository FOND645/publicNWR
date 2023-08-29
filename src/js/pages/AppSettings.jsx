import React, { useEffect } from "react";
import { Space, Typography, Divider, Button, Upload, message } from "antd";
import { useSelector } from "react-redux";
import { contentUnmounted } from "../functions";
import { ExpotrImport } from "../components/AppSettings/ExportImport.jsx";
import { ipcRenderer } from "electron";
const { Text, Title } = Typography;

function AppSettings(props) {
    const settings = useSelector((store) => store.settings);

    const [rebootToChange, contextHolder] = message.useMessage();

    function changePath(file, target) {
        let newPath = file.path.replaceAll("\\", "/");
        newPath = newPath.substring(0, newPath.lastIndexOf("/"));
        switch (target) {
            case "dataBasePath":
                props.setDataBasePath(newPath);
                break;
            case "documentsBasePath":
                props.setDocumentsBasePath(newPath);
                break;
        }
        rebootToChange.open({
            type: "info",
            content: "Для того чтобы изменения вступили в силу необходимо перезагрузить программу",
            duration: 6,
        });
    }

    const Component = (
        <Space direction="vertical" style={{ padding: "5px", width: "100%" }} id="AppSettings">
            {contextHolder}
            <Title level={2}>Настройки программы</Title>
            <Divider />

            <Title level={4}>Путь к базе данных</Title>
            <Space direction="horizontal">
                <Upload
                    showUploadList={false}
                    beforeUpload={(file) => {
                        changePath(file, "dataBasePath");
                        return false;
                    }}
                >
                    <Button>Изменить</Button>
                </Upload>
                <Text code>{settings.dataBasePath}</Text>
            </Space>

            <Title level={4}>Путь к готовым документам</Title>
            <Space direction="horizontal">
                <Upload
                    showUploadList={false}
                    beforeUpload={(file) => {
                        changePath(file, "documentsBasePath");
                        return false;
                    }}
                >
                    <Button>Изменить</Button>
                </Upload>
                <Text code>{settings.documentsBasePath}</Text>
            </Space>
            <Title level={2}>Экспорт/имопрт базы данных</Title>
            <ExpotrImport />
            <Divider />
            <Button onClick={() => ipcRenderer.send("open_dev_tools")}>Открыть консоль разработчика</Button>
        </Space>
    );

    useEffect(() => {
        return () => {
            contentUnmounted();
        };
    });

    return Component;
}

export default AppSettings;
