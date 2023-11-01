import { getResponseHeader } from '@src/globalFunctions';
import { connection } from '@src/render/root';
import { dataListner } from '@src/render/ResponseHandler';
import { city } from '@src/server/GETqueries';
import { WebSocketRequerst } from '@src/server/server';
import { AutoComplete, Button, Form, Input, Space, Spin } from 'antd';
import React, { FC } from 'react';
import { useQuery } from 'react-query';
import { LoadingError } from '../../Common/LoadingError';
import { DefaultOptionType } from 'rc-select/lib/Select';
import { dispatchMessage } from '../../PageLayout/PageLayout';
import { VALIDATION_MESSAGE_DURATION } from '@src/globalConsts';
import { addOrganizationQueryBody } from '@src/server/ADDqueries';
import styles from './AddOrganization.module.css';

type props = {};

function getCities() {
    return new Promise<city[]>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'cities',
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<city[]>(resolve, awaitedEventName);
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const AddOrganization: FC<props> = ({}) => {
    const { data, isError, isLoading, error } = useQuery(
        'database_cities',
        getCities,
        { refetchOnWindowFocus: false }
    );
    const [addOrganizationForm] = Form.useForm();

    if (isError) {
        return <LoadingError error={error} />;
    }
    if (isLoading) {
        return <Spin />;
    }
    if (!data) {
        return <div />;
    }

    const addOrganization: React.MouseEventHandler<HTMLElement> = () => {
        const name: string | undefined =
            addOrganizationForm.getFieldValue('name');
        const city: string | undefined =
            addOrganizationForm.getFieldValue('city');

        if (!name || !city) {
            dispatchMessage({
                type: 'error',
                content: 'Введите город и название организации',
                duration: VALIDATION_MESSAGE_DURATION,
            });
            return;
        }
        const queryBody: addOrganizationQueryBody = {
            type: 'add',
            url: 'organization',
            params: {
                name: name.trim(),
                city: city.trim(),
            },
        };
        connection?.send(JSON.stringify(queryBody));
    };

    const autoCompliteOptios: DefaultOptionType[] = data.map((City) => {
        return {
            label: City.city,
            value: City.city,
        };
    });

    return (
        <Form
            className={styles.AddOrganizationFrom}
            form={addOrganizationForm}>
            <Space.Compact
                className={styles.AddOrganizationContainer}
                direction={'horizontal'}>
                <Form.Item
                    name={'name'}
                    className={styles.AddOrganizationFormItem}>
                    <Input
                        placeholder="Название организации"
                        className={styles.AddOrganizationInput}
                    />
                </Form.Item>
                <Form.Item
                    name={'city'}
                    className={styles.AddOrganizationFormItem}>
                    <AutoComplete
                        placeholder="Город"
                        className={styles.AddOrganizationInput}
                        options={autoCompliteOptios}
                    />
                </Form.Item>
                <Button
                    onClick={addOrganization}
                    className={styles.AddOrganizationButton}>
                    Добавить организацию
                </Button>
            </Space.Compact>
        </Form>
    );
};
