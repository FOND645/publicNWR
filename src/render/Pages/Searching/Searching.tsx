import { Button, Divider, Form, Input, Space, Typography } from 'antd';
import React, { FC, useState } from 'react';
import styles from './Searching.module.css';
import { SearchOutlined } from '@ant-design/icons';
import { SearchingTable } from './Components/SearchingTable';
import { qureyClient } from '@src/render';
// import { qureyClient } from '@src/render';

const { Title } = Typography;

type props = {};

export const Searching: FC<props> = ({}) => {
    const [searchingQuery, setSearchingQuery] = useState<undefined | string>(
        undefined
    );

    const [SearchingForm] = Form.useForm();

    const search = () => {
        const query: string | undefined = SearchingForm.getFieldValue('query');
        qureyClient
            .invalidateQueries(`get_searchingRepair_response`)
            .then(() => {
                setSearchingQuery(query);
            });
    };

    return (
        <Space.Compact
            className={styles.SearchingContainer}
            direction="vertical">
            <Title
                className={styles.SearchingTitle}
                level={2}>
                Поиск устройств
            </Title>
            <Divider />
            <Space.Compact
                direction="horizontal"
                className={styles.SearchingInputContainer}>
                <Form
                    form={SearchingForm}
                    className={styles.SearchingFrom}>
                    <Form.Item
                        name="query"
                        className={styles.SearchingFormItem}>
                        <Input
                            placeholder="Введите заводской номер для поиска..."
                            className={styles.SearchingInput}
                        />
                    </Form.Item>
                </Form>
                <Button
                    onClick={search}
                    className={styles.SearchingButton}>
                    <SearchOutlined />
                </Button>
            </Space.Compact>
            <SearchingTable searchingQuery={searchingQuery} />
        </Space.Compact>
    );
};
