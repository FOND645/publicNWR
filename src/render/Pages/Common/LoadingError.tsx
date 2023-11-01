import { Alert } from 'antd';
import React, { FC } from 'react';
import styles from './LoadingError.module.css';

type props = {
    error: unknown;
};

export const LoadingError: FC<props> = ({ error }) => {
    return (
        <Alert
            className={styles.LoadingError}
            message={`Ошибка загрузки данных с сервера \n ${JSON.stringify(
                error,
                null,
                2
            )}`}
            type={'error'}
            showIcon
        />
    );
};
