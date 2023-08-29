import { Button, Modal, Space, Typography, Upload, message } from "antd";
import React, { useEffect } from "react";
import { isFolderAbleToRemove } from "../../functions";
import { ipcRenderer } from "electron";
import Seven from "node-7z";
import sevenBin from "7zip-bin";
import { store } from "../../storage/reducer";
import path from "path";
import { useState } from "react";
import { isEqual } from "lodash";

const { Text, Title } = Typography;
const fs = require("fs");
const bin7zip = sevenBin.path7za;

function Component(props) {
    const settings = store.getState().settings;
    const { dataBasePath, documentsBasePath } = settings;

    const [modalState, setModalState] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    function getDateForAchive() {
        const nowTime = new Date();

        const year = nowTime.getFullYear();
        const month = (nowTime.getMonth() + 1).toString().padStart(2, 0);
        const day = nowTime.getDate().toString().padStart(2, 0);
        const hour = nowTime.getHours().toString().padStart(2, 0);
        const minutes = nowTime.getMinutes().toString().padStart(2, 0);

        const currentDate = `${year}.${month}.${day}_${hour}.${minutes}`;
        return currentDate;
    }

    // Открытие модального окна
    function openImportModal() {
        setModalState(true)
    }

    // Модальное окно для подтверждения импорта. 
    const modalWindow = (
        <Modal
            open={modalState}
            onOk={importDataBase}
            onCancel={() => setModalState(false)}
            okText={"Продолжить"}
            cancelText={"Отмена"}
            title={
                <Text strong type={"danger"}>
                    ВНИМАНИЕ!
                </Text>
            }
        >
            <Text>
                Перед импортом новой базы данных, убедитесь что архив который вы импортируете является созданой программой базой. Во избежание потери
                данных экспортируйте бэкап старой базы и закройте все программы работающие с файлами из базы данных (MS Excel). В случае имопрта некорректной базы программа работать не будет.
            </Text>
        </Modal>
    );

    // Функция импорта БД. Открывает окно для выбора 7z файла.
    // Выполняется после подтверждения в модальном окне.
    function importDataBase() {
        setModalState(false)
        let importBasePath
        let archiveMap = new Set()
        const options = {
            title: "Выберите архив с базой данных",
            query: "archive_with_data_base"
        }
        ipcRenderer.send("open_7z_archive", options)
        ipcRenderer.once("archive_with_data_base", (event, outputPath) => {
            importBasePath = outputPath
            const archReadingListStream = Seven.list(importBasePath, {
                recursive: false,
                $bin: bin7zip
            })
            archReadingListStream.on("data", (data) => archiveMap.add(data.file))
            archReadingListStream.once("end", validateArchive)
        })
        const validateArchive = () => {
            const hasArchiveNeedsFiles = archiveMap.has("blanks") &&
                archiveMap.has("contracts.json") &&
                archiveMap.has("defectsBase.json") &&
                archiveMap.has("devicesBase.json") &&
                archiveMap.has("materialsBase.json") 
                if (hasArchiveNeedsFiles) {
                    importBase()
                } else {
                    messageApi.open({
                        type: "error",
                        content: "Архив не содержит всех необходимых файлов",
                        duration: 6
                    })
                }
        }
        const importBase = () => {
            // Проверяем нет ли заблокированных файлов в папке с БД
            if (!isFolderAbleToRemove(dataBasePath)) {
                messageApi.open({
                    type: "error",
                    content: "Один из файлов старой базы данных заблокирован. Закройте все связанные программы",
                    duration: 6
                })
                return
            }
            fs.rmdirSync(dataBasePath, {recursive: true})
            fs.mkdirSync(dataBasePath)
            const unpackStream = Seven.extractFull(importBasePath, dataBasePath, {$bin: bin7zip, recursive: true})

            unpackStream.on("end", () => messageApi.open({
                type: "success",
                content: "База успешно импортирована",
                duration: 6
            }))
        }
    }

    // Функция экспорта БД и слушатель IPC связанный с ней
    function exportDataBase() {
        const options = {
            query: "directory_to_export_data_base",
            title: "Выберите папку для экспорта базы данных",
        };
        ipcRenderer.send("open_folder_dialog", options);
        ipcRenderer.once("directory_to_export_data_base", (event, outPath) => {
            const archiveName = `NWR_database_${getDateForAchive()}.7z`;
            const archivePath = path.resolve(outPath, archiveName);

            const packingStream = Seven.add(archivePath, dataBasePath + "/*", {
                recursive: true,
                $bin: bin7zip,
            });

            packingStream.once("error", (error) => {
                console.log(error)
                messageApi.open({
                    type: "error",
                    content: `Ошибка экспорта:\n
                ${error.message}\n
                ${error.stderr}`,
                    duration: 8,
                })
            }
            );

            packingStream.once("end", () =>
                messageApi.open({
                    type: "success",
                    content: `База данных успешно экспортирована в файл \n
                ${archivePath}`,
                    duration: 8,
                })
            );
        });
    }

    return (
        <Space id="ExpotrImport" direction={"horizontal"}>
            {contextHolder}
            {modalWindow}
            <Button onClick={exportDataBase}>Экспорт базы данных</Button>
            <Button onClick={openImportModal}>Импорт базы данных</Button>
        </Space>
    );
}

export const ExpotrImport = React.memo(Component, (oldProps, newProps) => isEqual(oldProps, newProps))
