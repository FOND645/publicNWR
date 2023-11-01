import { FolderOpenFilled } from '@ant-design/icons';
import { folderExists } from '@src/globalFunctions';
import { getFolderDialogOptions } from '@src/main/main';
import { TAppContext, appContext, editSettings } from '@src/render/context';
import { Button, Divider, Form, Input, Space, Typography } from 'antd';
import { ipcRenderer } from 'electron';
import React, { FC } from 'react';
import { dispatchMessage } from '../../PageLayout/PageLayout';
import { VALIDATION_MESSAGE_DURATION } from '@src/globalConsts';
import styles from './AppSettings.module.css';

const { Title } = Typography;

type props = {};

export const AppSettings: FC<props> = ({}) => {
    const [settingForm] = Form.useForm();

    const selectFolder = (out: 'blanksFolder' | 'docsFolder') => {
        return () => {
            const options: getFolderDialogOptions = {
                query: 'directory_to_export_data_base',
                title: 'Выберите папку',
            };
            ipcRenderer.send('open_folder_dialog', options);
            ipcRenderer.once(
                options.query,
                (event: Electron.IpcRendererEvent, outPath: string) => {
                    settingForm.setFieldValue(out, outPath);
                }
            );
        };
    };

    const setFolder = (out: 'blanksFolder' | 'docsFolder') => {
        return () => {
            editSettings((settings) => {
                settings = {
                    blankPath: settings?.blankPath || '',
                    documentsPath: settings?.documentsPath || '',
                    serverIP: settings?.serverIP || `127.0.0.1`,
                    serverWSport: settings?.serverWSport || 7421,
                };
                const newPath: string | undefined =
                    settingForm.getFieldValue(out);
                if (!newPath || !folderExists(newPath)) {
                    dispatchMessage({
                        type: 'error',
                        content: 'Указаный путь недействителен',
                        duration: VALIDATION_MESSAGE_DURATION,
                    });
                    return settings;
                }
                if (out === 'blanksFolder') settings.blankPath = newPath;
                if (out === 'docsFolder') settings.documentsPath = newPath;
                return settings;
            });
        };
    };

    const { settings } = appContext as Required<TAppContext>;
    const { blankPath, documentsPath } = settings;
    return (
        <Space.Compact
            direction="vertical"
            className={styles.AppSettingsContainer}>
            <Title
                level={2}
                className={styles.AppSettingsTitle}>
                Настройка приложения
            </Title>
            <Divider />
            <Title
                level={4}
                className={styles.AppSettingsBlanksTitle}>
                Расположение бланков
            </Title>
            <Space.Compact
                direction="horizontal"
                className={styles.AppSettingsBlanksContainer}>
                <Button
                    onClick={selectFolder('blanksFolder')}
                    className={styles.AppSettingsBlanksSelectButton}>
                    <FolderOpenFilled />
                </Button>
                <Form.Item
                    className={styles.AppSettingsBlanksFromItem}
                    name={'blanksFolder'}
                    initialValue={blankPath}>
                    <Input
                        placeholder="Укажите папку"
                        className={styles.AppSettingsBlanksInput}
                    />
                </Form.Item>
                <Button
                    className={styles.AppSettingsBlanksSetButton}
                    onClick={setFolder('blanksFolder')}>
                    Изменить
                </Button>
            </Space.Compact>
            <Title
                level={4}
                className={styles.AppSettingsDocsTitle}>
                Расположение документов
            </Title>
            <Space.Compact
                direction="horizontal"
                className={styles.AppSettingsDocsContainer}>
                <Button
                    onClick={selectFolder('docsFolder')}
                    className={styles.AppSettingsDocsSelectButton}>
                    <FolderOpenFilled />
                </Button>
                <Form.Item
                    className={styles.AppSettingsDocsFromItem}
                    name={'docsFolder'}
                    initialValue={documentsPath}>
                    <Input
                        placeholder="Укажите папку"
                        className={styles.AppSettingsDocsInput}
                    />
                </Form.Item>
                <Button
                    className={styles.AppSettingsDocsSetButton}
                    onClick={setFolder('docsFolder')}>
                    Изменить
                </Button>
            </Space.Compact>
        </Space.Compact>
    );
};
