import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Form, Input, Space } from 'antd';
import React, { FC } from 'react';
import styles from './TableSearcher.module.css';

type props = {
    rawData: { id: number; [k: string]: string | number | null }[];
    setSearchedIDs: (value: number[] | false) => void;
};

export const TableSearcher: FC<props> = ({ rawData, setSearchedIDs }) => {
    const [searchForm] = Form.useForm();

    const search = () => {
        const query: string | undefined =
            searchForm.getFieldValue('searchQuery');
        if (!query) {
            setSearchedIDs(false);
            return;
        }
        const filtredIDs = rawData
            .filter((Element) => {
                for (let field in Element) {
                    const fieldValue =
                        typeof Element[field] === 'number'
                            ? (Element[field] as number).toString()
                            : (Element[field] as string);
                    if (fieldValue.toLowerCase().includes(query.toLowerCase()))
                        return true;
                }
            })
            .map((Element) => Element.id);
        setSearchedIDs(filtredIDs);
    };

    const resetSearch = () => {
        setSearchedIDs(false);
    };

    return (
        <Form
            form={searchForm}
            className={styles.TableSearcherForm}>
            <Space.Compact className={styles.TableSearcherContainer}>
                <Form.Item
                    name={'searchQuery'}
                    className={styles.TableSearcherFormItem}>
                    <Input
                        placeholder="Поиск..."
                        className={styles.TableSearcherInput}
                    />
                </Form.Item>
                <Button
                    onClick={search}
                    className={styles.TableSearcherFormButton}>
                    <SearchOutlined />
                </Button>
                <Button
                    onClick={resetSearch}
                    className={styles.TableSearcherButton}>
                    <CloseOutlined />
                </Button>
            </Space.Compact>
        </Form>
    );
};
