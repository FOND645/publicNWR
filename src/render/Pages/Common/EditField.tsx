import { Form, Input, InputNumber } from 'antd';
import React, { FC } from 'react';
import styles from './EditField.module.css';

type data = {
    id: number;
    [key: string]: number | string | null;
};

type props = {
    data: data;
    field: keyof data;
    type: 'numder' | 'text';
    editingID: number | false;
};

export const EditField: FC<props> = ({ data, field, editingID, type }) => {
    const { id } = data;

    if (editingID === id) {
        return (
            <Form.Item
                name={`${id}_${field}`}
                initialValue={data[field]}
                className={styles.EditFieldFormItem}>
                {type === 'numder' ? (
                    <InputNumber
                        min={0}
                        className={styles.EditFieldinputNumber}
                    />
                ) : (
                    <Input className={styles.EditFieldinput} />
                )}
            </Form.Item>
        );
    } else {
        return data[field];
    }
};
