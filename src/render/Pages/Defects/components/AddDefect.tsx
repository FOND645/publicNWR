import { Button, Form, Input, Select, Space, Spin } from 'antd';
import React, { FC } from 'react';
import { useQuery } from 'react-query';
import { Option, getBlocks } from './SelectBlock';
import { LoadingError } from '../../Common/LoadingError';
import { blockToSelect } from '@src/server/GETqueries';
import { addNewDefectQueryBody } from '@src/server/ADDqueries';
import { dispatchMessage } from '../../PageLayout/PageLayout';
import { VALIDATION_MESSAGE_DURATION } from '@src/globalConsts';
import { connection } from '@src/render/root';
import { appContext } from '@src/render/context';
import styles from './AddDefect.module.css';

type props = {};

export const AddDefect: FC<props> = ({}) => {
    const { data, isError, isLoading, error } = useQuery(
        `database_blocks`,
        getBlocks,
        {
            refetchOnWindowFocus: false,
        }
    );
    const [addDefectForm] = Form.useForm();
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

    const blocks = data as blockToSelect[];

    const options = blocks.map((block) => {
        const option: Option = {
            value: block.block_id,
            decimal: block.decimal,
            label: `${block.is_leading ? '=> ' : ''} ${block.name}`,
        };
        return option;
    });

    const addDefect: React.MouseEventHandler<HTMLElement> = () => {
        const blockID: number | undefined =
            addDefectForm.getFieldValue('blockID');
        const description: string | undefined =
            addDefectForm.getFieldValue('description');
        const defect: string | '' = addDefectForm.getFieldValue('defect') || '';
        const solution: string | '' =
            addDefectForm.getFieldValue('solution') || '';
        if (!blockID || !description) {
            dispatchMessage({
                type: 'warning',
                content: 'Укажите блок и короткое описание неисправности',
                duration: VALIDATION_MESSAGE_DURATION,
            });
            return;
        }
        const queryBody: addNewDefectQueryBody = {
            type: 'add',
            url: 'defect',
            params: {
                blockID: blockID,
                defect: defect,
                description: description,
                solution: solution,
            },
        };
        connection?.send(JSON.stringify(queryBody));
    };

    return (
        <Form
            form={addDefectForm}
            className={styles.AddDefectForm}>
            <Space.Compact
                direction={'horizontal'}
                block
                className={styles.AddDefectContainer}>
                <Form.Item
                    name={'blockID'}
                    className={styles.AddDefectFormItem}>
                    <Select
                        options={options}
                        className={styles.AddDefectInput}
                    />
                </Form.Item>
                <Form.Item
                    name={'description'}
                    className={styles.AddDefectFormItem}>
                    <Input.TextArea
                        placeholder="Краткое описание дефекта"
                        className={styles.AddDefectInput}
                        autoSize={{ minRows: 1, maxRows: 6 }}
                    />
                </Form.Item>
                <Form.Item
                    name={'defect'}
                    className={styles.AddDefectFormItem}>
                    <Input.TextArea
                        placeholder="Описание дефекта"
                        autoSize={{ minRows: 1, maxRows: 6 }}
                        className={styles.AddDefectInput}
                    />
                </Form.Item>
                <Form.Item
                    name={'solution'}
                    className={styles.AddDefectFormItem}>
                    <Input.TextArea
                        placeholder="Решение"
                        autoSize={{ minRows: 1, maxRows: 6 }}
                        className={styles.AddDefectInput}
                    />
                </Form.Item>
                <Button
                    onClick={addDefect}
                    className={styles.AddDefectButton}>
                    Добавить неисправность
                </Button>
            </Space.Compact>
        </Form>
    );
};
