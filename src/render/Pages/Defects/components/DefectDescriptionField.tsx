import React, { FC } from 'react';
import { defectForDescription } from '@src/server/GETqueries';
import { Form, Input } from 'antd';
import styles from './DefectDescriptionField.module.css';

type props = {
    isEditing: boolean;
    data: defectForDescription;
    field: keyof defectForDescription;
};

export const DefectDescriptionField: FC<props> = ({
    isEditing,
    data,
    field,
}) => {
    if (isEditing) {
        return (
            <Form.Item
                className={styles.DefectDescriptionField}
                name={field}
                initialValue={data[field]}>
                <Input className={styles.DefectDescriptionFieldInput} />
            </Form.Item>
        );
    } else {
        return data[field];
    }
};
