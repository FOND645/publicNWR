import { Button, Divider, Space, Spin, Tooltip } from 'antd';
import React, { FC } from 'react';
import { useQuery } from 'react-query';
import { LoadingError } from '@src/render/Pages/Common/LoadingError';
import { docsStatus } from '@src/server/GETqueries';
import { WebSocketRequerst } from '@src/server/server';
import { connection } from '@src/render/root';
import { dataListner } from '@src/render/ResponseHandler';
import { getResponseHeader } from '@src/globalFunctions';
import { appContext } from '@src/render/context';
import { shell } from 'electron';
import path from 'path';
import { RedoOutlined } from '@ant-design/icons';
import { qureyClient } from '@src/render';
import styles from './DocumentsEditor.module.css';

type props = {
    contractID: number;
    repairDeviceID: number;
};

export function getFileStatus(repairDeviceID: number, contractID: number) {
    return new Promise<docsStatus>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'blanksAndDocsStatus',
            targetID: repairDeviceID,
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<docsStatus>(resolve, awaitedEventName);
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const DocumentsEditor: FC<props> = ({ repairDeviceID, contractID }) => {
    const { isError, isLoading, error, data } = useQuery(
        `files_${repairDeviceID}_${contractID}`,
        () => getFileStatus(repairDeviceID, contractID),
        { refetchOnWindowFocus: false }
    );
    if (appContext.auth.roots === 'watcher') return null;
    if (isError) {
        return <LoadingError error={error} />;
    }
    if (isLoading) {
        return <Spin />;
    }
    if (!data) {
        return <div />;
    }

    const {
        actionBlank,
        actionDocumnet,
        defectBlank,
        defectDocument,
        deviceName,
        repairNumber,
        serialNumber,
    } = data;

    const { settings } = appContext;
    if (!settings) return null;
    const { documentsPath } = settings;

    const defectListPath = path.resolve(
        documentsPath,
        contractID.toString(),
        'Карты дефектации',
        `${deviceName} - №${repairNumber} ${serialNumber}.xlsx`
    );

    const actionListPath = path.resolve(
        documentsPath,
        contractID.toString(),
        `Перечни выполненых работ`,
        `${deviceName} - №${repairNumber} ${serialNumber}.xlsx`
    );

    const refetchDocsStatus = () => {
        qureyClient.invalidateQueries(`files_${repairDeviceID}_${contractID}`, {
            refetchActive: true,
        });
    };

    const openFolder = (
        target: 'defect' | 'actions',
        type: 'file' | 'folder'
    ) => {
        const filePath = target === 'actions' ? actionListPath : defectListPath;
        if (type === 'file') {
            shell.openPath(filePath);
        } else {
            shell.showItemInFolder(filePath);
        }
    };

    const createList = (type: 'defect' | 'actions') => {
        const request: WebSocketRequerst = {
            type: 'add',
            url: type === 'defect' ? 'createDefectList' : 'createActionList',
            params: {
                repairDeviceID: repairDeviceID,
            },
        };
        connection?.send(JSON.stringify(request));
        setTimeout(refetchDocsStatus, 300);
    };

    return (
        <Space
            direction="vertical"
            className={styles.DocumentsEditorContainer}>
            <Space.Compact
                direction="horizontal"
                className={styles.DocumentsEditorDefContainer}>
                <Tooltip title="Обновить информацию о доступности документов">
                    <RedoOutlined
                        onClick={refetchDocsStatus}
                        className={styles.DocumentsEditorUpdateStatusButton}
                    />
                </Tooltip>
                <Divider type="vertical" />
                <Button
                    className={styles.DocumentsEditorCreateDefectListButton}
                    disabled={!defectBlank}
                    onClick={() => createList('defect')}>
                    Создать карту дефектации
                </Button>
                <Button
                    className={styles.DocumentsEditorOpenDefectListButton}
                    disabled={!defectDocument}
                    onClick={() => openFolder('defect', 'file')}>
                    Открыть
                </Button>
                <Button
                    className={styles.DocumentsEditorFolderDefectListButton}
                    disabled={!defectDocument}
                    onClick={() => openFolder('defect', 'folder')}>
                    Папка
                </Button>
            </Space.Compact>
            <Space.Compact className={styles.DocumentsEditorActContainer}>
                <Button
                    className={styles.DocumentsEditorCreateActionListButton}
                    disabled={!actionBlank}
                    onClick={() => createList('actions')}>
                    Создать перечень выполненых работ
                </Button>
                <Button
                    className={styles.DocumentsEditorOpenActionListButton}
                    disabled={!actionDocumnet}
                    onClick={() => openFolder('actions', 'file')}>
                    Открыть
                </Button>
                <Button
                    className={styles.DocumentsEditorFolderActionListButton}
                    disabled={!actionDocumnet}
                    onClick={() => openFolder('actions', 'folder')}>
                    Папка
                </Button>
            </Space.Compact>
        </Space>
    );
};
