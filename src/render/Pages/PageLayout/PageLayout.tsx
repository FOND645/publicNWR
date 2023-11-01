import React, { FC, useEffect } from 'react';
import { Image, Layout, message } from 'antd';
import { Outlet } from 'react-router';
import { MainMenu } from '@src/render/Pages/PageLayout/components/MainMenu';
import { connection } from '@src/render/root';
import { responseHandler } from '@src/render/ResponseHandler';
import Logo from '@public/logo.png';
import styles from './PageLayout.module.css';

const { Sider, Content } = Layout;

export interface MessageDescription {
    type?: 'warning' | 'error' | 'success' | undefined;
    content: string;
    duration: number;
}

export interface MessageEvent extends Event {
    description?: MessageDescription;
}

export function dispatchMessage(description: MessageDescription): void {
    let messageEvent: MessageEvent = new Event('page_message', {
        bubbles: false,
        composed: true,
    });
    messageEvent.description = description;
    document.dispatchEvent(messageEvent);
}

export const PageLayout: FC = () => {
    const [messageAPI, messageContext] = message.useMessage();

    function openMessage(event: MessageEvent) {
        if (event.description) {
            messageAPI.open(event.description);
        }
    }

    useEffect(() => {
        document.addEventListener('page_message', openMessage);
        connection?.addEventListener('message', responseHandler);
    });
    return (
        <Layout className={styles.PageLayout}>
            <Sider className={styles.Sider}>
                <Image
                    className={styles.LogoImage}
                    src={Logo}
                    preview={false}
                />
                <MainMenu />
            </Sider>

            <Content
                id="content"
                className={styles.content}>
                {messageContext}
                <Outlet />
            </Content>
        </Layout>
    );
};
