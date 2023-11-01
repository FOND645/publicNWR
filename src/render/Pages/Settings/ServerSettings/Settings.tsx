import {
    FileTextOutlined,
    FolderOpenFilled,
    TableOutlined,
} from '@ant-design/icons';
import { editDocsPath } from '@src/server/EDITqueries';
import {
    Button,
    Divider,
    Form,
    Input,
    Space,
    Spin,
    Switch,
    Typography,
} from 'antd';
import React, { FC } from 'react';
import { dispatchMessage } from '../../PageLayout/PageLayout';
import { VALIDATION_MESSAGE_DURATION } from '@src/globalConsts';
import { connection } from '@src/render/root';
import { AppSettings } from '@src/server/settings';
import { WebSocketRequerst } from '@src/server/server';
import { getResponseHeader } from '@src/globalFunctions';
import { dataListner } from '@src/render/ResponseHandler';
import { useQuery } from 'react-query';
import { LoadingError } from '../../Common/LoadingError';
import { ipcRenderer } from 'electron';
import { getFolderDialogOptions } from '@src/main/main';
import { BackUPs } from './Components/BackUPs';
import styles from './Settings.module.css';

const { Title, Text } = Typography;

type props = {};

function getSettings() {
    return new Promise<AppSettings>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'serverSettings',
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<AppSettings>(resolve, awaitedEventName);
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const ServerSettings: FC<props> = ({}) => {
    const { data, isError, isLoading, error } = useQuery(
        'server_settings',
        getSettings,
        { refetchOnWindowFocus: false }
    );

    const [serverSettingsForm] = Form.useForm();

    if (isError) {
        return <LoadingError error={error} />;
    }
    if (isLoading) {
        return <Spin />;
    }
    if (!data) {
        return <div />;
    }

    const setBlanksPath = () => {
        const blanksPath: string | undefined =
            serverSettingsForm.getFieldValue('blnaksPath');
        if (!blanksPath) {
            dispatchMessage({
                type: 'error',
                duration: VALIDATION_MESSAGE_DURATION,
                content: 'Введите путь',
            });
            return;
        }
        const queryBody: editDocsPath = {
            type: 'edit',
            url: 'blanksPath',
            params: {
                newPath: blanksPath,
            },
        };
        connection?.send(JSON.stringify(queryBody));
    };

    const setDocsPath = () => {
        const docsPath: string | undefined =
            serverSettingsForm.getFieldValue('docsPath');
        if (!docsPath) {
            dispatchMessage({
                type: 'error',
                duration: VALIDATION_MESSAGE_DURATION,
                content: 'Введите путь',
            });
            return;
        }
        const queryBody: editDocsPath = {
            type: 'edit',
            url: 'docsPath',
            params: {
                newPath: docsPath,
            },
        };
        connection?.send(JSON.stringify(queryBody));
    };

    const selectFolder = (type: 'docsPath' | 'blnaksPath') => {
        const options: getFolderDialogOptions = {
            query: 'directory_to_export_data_base',
            title: 'Выберите папку',
        };
        ipcRenderer.send('open_folder_dialog', options);
        ipcRenderer.once(
            options.query,
            (event: Electron.IpcRendererEvent, outPath: string) => {
                serverSettingsForm.setFieldValue(type, outPath);
            }
        );
    };

    return (
        <Space.Compact
            className={styles.SettingsContainer}
            direction="vertical">
            <Form
                form={serverSettingsForm}
                className={styles.SettingsForm}>
                <Title className={styles.SettingsTitle}>
                    Настройки сервера
                </Title>
                <BackUPs />
                <Divider />
                <Space.Compact direction="horizontal">
                    <TableOutlined />
                    <Title level={3}>Путь для сохранения бланков</Title>
                </Space.Compact>
                <Space.Compact direction="horizontal">
                    <Button onClick={() => selectFolder('blnaksPath')}>
                        <FolderOpenFilled />
                    </Button>
                    <Form.Item
                        name={'blnaksPath'}
                        initialValue={data.blanksFolerPath}>
                        <Input />
                    </Form.Item>
                    <Button onClick={setBlanksPath}>Изменить</Button>
                </Space.Compact>
                <Divider />
                <Space.Compact direction="horizontal">
                    <FileTextOutlined />
                    <Title level={3}>Путь для сохранения документов</Title>
                </Space.Compact>
                <Space.Compact direction="horizontal">
                    <Button onClick={() => selectFolder('docsPath')}>
                        <FolderOpenFilled />
                    </Button>
                    <Form.Item
                        name={'docsPath'}
                        initialValue={data.documentsFolderPath}>
                        <Input />
                    </Form.Item>
                    <Button onClick={setDocsPath}>Изменить</Button>
                </Space.Compact>
                <Space.Compact>
                    <Switch checked={data.enableWebVersion} />
                    <Text>Web-интерфейс</Text>
                </Space.Compact>
            </Form>
        </Space.Compact>
    );
};
