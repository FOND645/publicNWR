import React, { FC, useState } from 'react';
import { Routing } from './Routing';
import { Authorization } from './Authorization';

export let connection: WebSocket | undefined;
function setConnection(value: WebSocket) {
    connection = value;
    return connection;
}
function getConnection() {
    return connection;
}

type props = {};

export const Root: FC<props> = ({}) => {
    const [loginStatus, setLoginStatus] = useState<boolean>(false);
    const [loginError, setLoginError] = useState<string | undefined>();

    if (loginStatus) {
        return <Routing />;
    } else {
        return (
            <Authorization
                setConncetion={setConnection}
                loginState={[loginStatus, setLoginStatus]}
                connection={getConnection}
                loginErrorState={[loginError, setLoginError]}
            />
        );
    }
};
