import { Button, Space, Spin, Typography, Upload } from 'antd';
import React, { FC } from 'react';
import { useQuery } from 'react-query';
import { LoadingError } from '@src/render/Pages/Common/LoadingError';
import { getFileStatus } from './DocumentsEditor';
import { appContext } from '@src/render/context';
import { RcFile } from 'antd/es/upload';
import { connection } from '@src/render/root';
import { addActionBlank, addDefectBlank } from '@src/server/ADDqueries';
import { shell } from 'electron';
import path from 'path';
import { qureyClient } from '@src/render';
import styles from './BlanksEditor.module.css';

const { Text } = Typography;

type props = {
    contractID: number;
    repairDeviceID: number;
};

export const BlanksEditor: FC<props> = ({ repairDeviceID, contractID }) => {
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

    const { settings } = appContext;
    if (!settings) return null;
    const { blankPath } = settings;
    const { deviceID } = data;

    const defectBlankPath = path.resolve(
        blankPath,
        contractID.toString(),
        `${deviceID}_defectBlank.xlsx`
    );

    const actionBlankPath = path.resolve(
        blankPath,
        contractID.toString(),
        `${deviceID}_actionBlank.xlsx`
    );

    const openBlank = (type: 'action' | 'defect') => {
        shell.openPath(type === 'action' ? actionBlankPath : defectBlankPath);
    };

    const refetchDocsStatus = () => {
        qureyClient.invalidateQueries(`files_${repairDeviceID}_${contractID}`, {
            refetchActive: true,
        });
    };

    const uploadActionBlank = async (file: RcFile) => {
        const reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = (event) => {
            const queryBody: addActionBlank = {
                type: 'add',
                url: 'actionBlank',
                params: {
                    contractID: contractID,
                    repairDeviceID: repairDeviceID,
                    rawFile: event.target?.result as string,
                },
            };
            connection?.send(JSON.stringify(queryBody));
            setTimeout(refetchDocsStatus, 300);
        };
        return false;
    };

    const uploadDefectBlank = async (file: RcFile) => {
        const reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = (event) => {
            const queryBody: addDefectBlank = {
                type: 'add',
                url: 'defectBlank',
                params: {
                    contractID: contractID,
                    repairDeviceID: repairDeviceID,
                    rawFile: event.target?.result as string,
                },
            };
            connection?.send(JSON.stringify(queryBody));
            setTimeout(refetchDocsStatus, 300);
        };
        return false;
    };

    return (
        <Space
            direction="vertical"
            className={styles.BlanksEditorContainer}>
            <Space className={styles.BlanksDefEditorContainer}>
                <Text
                    type={data?.defectBlank ? undefined : 'warning'}
                    className={styles.BlanksDefTitle}>
                    Шаблон дефектовки
                </Text>
                {data?.defectBlank ? (
                    <Space.Compact
                        direction="horizontal"
                        className={styles.BlanksDefExistContainer}>
                        <Button
                            onClick={() => openBlank('defect')}
                            className={styles.BlanksDefExistButtonOpen}>
                            Открыть
                        </Button>
                        <Upload
                            beforeUpload={uploadDefectBlank}
                            showUploadList={false}>
                            <Button
                                className={styles.BlanksDefExistButtonReplace}>
                                Заменить
                            </Button>
                        </Upload>
                    </Space.Compact>
                ) : (
                    <Upload
                        beforeUpload={uploadDefectBlank}
                        showUploadList={false}>
                        <Button className={styles.BlanksDefExistButtonImport}>
                            Импортировать
                        </Button>
                    </Upload>
                )}
            </Space>
            <Space className={styles.BlanksActEditorContainer}>
                <Text
                    type={data?.actionBlank ? undefined : 'warning'}
                    className={styles.BlanksActEditorContainer}>
                    Шаблок перечня
                </Text>
                {data?.actionBlank ? (
                    <Space.Compact
                        direction="horizontal"
                        className={styles.BlanksActExistContainer}>
                        <Button onClick={() => openBlank('action')}>
                            Открыть
                        </Button>
                        <Upload
                            showUploadList={false}
                            beforeUpload={uploadActionBlank}>
                            <Button
                                className={styles.BlanksActExistButtonReplace}>
                                Заменить
                            </Button>
                        </Upload>
                    </Space.Compact>
                ) : (
                    <Upload
                        beforeUpload={uploadActionBlank}
                        showUploadList={false}>
                        <Button className={styles.BlanksActExistButtonImport}>
                            Импортировать
                        </Button>
                    </Upload>
                )}
            </Space>
        </Space>
    );
};
