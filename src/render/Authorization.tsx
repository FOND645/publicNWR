import { Button, Form, Input, Space, Typography } from 'antd';
import React, { FC } from 'react';
import { appContext, setAuth } from './context';
import { authResult } from '@src/server/authorization';
import { authParams } from '@src/globalTypes';
const { Text } = Typography;
import styles from './Authorization.module.css';

type props = {
    setConncetion: (value: WebSocket) => WebSocket;
    connection: () => WebSocket | undefined;
    loginState: [
        loginStatus: boolean,
        setLoginStatus: React.Dispatch<React.SetStateAction<boolean>>,
    ];
    loginErrorState: [
        loginError: string | undefined,
        setLoginError: React.Dispatch<React.SetStateAction<string | undefined>>,
    ];
};

export const Authorization: FC<props> = ({
    loginErrorState,
    loginState,
    connection,
    setConncetion,
}) => {
    const [_, setLoginStatus] = loginState;
    const [loginError, setLoginError] = loginErrorState;
    const [authForm] = Form.useForm();

    const authResponseHandler = (message: MessageEvent<string>) => {
        const authResult = JSON.parse(message.data) as authResult;
        if (authResult.status) {
            const { user } = authResult;
            if (!user) return;
            const { roots } = user;
            setAuth({ status: true, roots: roots });
            setLoginStatus(true);
            (connection() as WebSocket).removeEventListener(
                'message',
                authResponseHandler
            );
        } else {
            setLoginError('Неверный логин или пароль');
            setAuth({ status: false });
            (connection() as WebSocket).removeEventListener(
                'message',
                authResponseHandler
            );
        }
    };

    const tryAuth: React.MouseEventHandler<HTMLElement> = () => {
        const login: string | undefined = authForm.getFieldValue('login');
        const password: string | undefined = authForm.getFieldValue('password');
        if (!login || !password) {
            setLoginError('Введите логин и пароль');
            return;
        } else {
            const { settings } = appContext;
            let WSaddres: string = '';
            if (
                settings?.serverIP === undefined ||
                settings?.serverWSport === undefined
            ) {
                WSaddres = `ws://${window.location.host}:7421`;
            } else {
                WSaddres = `ws://${settings?.serverIP}:${settings?.serverWSport}`;
            }
            const authData: authParams = {
                login: login,
                password: password,
            };
            setConncetion(new WebSocket(WSaddres)).onerror = (error) => {
                setLoginError('Ошибка соединения');
            };
            (connection() as WebSocket).onopen = () => {
                (connection() as WebSocket).addEventListener(
                    'message',
                    authResponseHandler
                );
                (connection() as WebSocket).send(JSON.stringify(authData));
            };
        }
    };

    console.log(styles);

    return (
        <Space className={styles.AuthorizationPage}>
            <Space.Compact
                className={styles.Authorization}
                direction="vertical">
                <Form
                    className={styles.AuthorizationForm}
                    form={authForm}>
                    <Form.Item
                        className={styles.AuthorizationItem}
                        name={'login'}>
                        <Input
                            className={styles.AuthorizationLogin}
                            placeholder="Введите логин"
                        />
                    </Form.Item>
                    <Form.Item
                        className={styles.AuthorizationItem}
                        name={'password'}>
                        <Input.Password
                            className={styles.AuthorizationPassword}
                            placeholder="Введите пароль"
                        />
                    </Form.Item>
                    {loginError ? (
                        <Text
                            className={styles.AuthorizationError}
                            type={'danger'}>
                            {loginError}
                        </Text>
                    ) : null}
                    <Button
                        className={styles.AuthorizationButton}
                        onClick={tryAuth}>
                        Войти
                    </Button>
                </Form>
            </Space.Compact>
        </Space>
    );
};
