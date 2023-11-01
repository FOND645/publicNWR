import React, { FC, useState } from 'react';
import { useQuery } from 'react-query';
import { Button, Form, Input, InputNumber, Select, Space, Spin } from 'antd';
import { dispatchMessage } from '@src/render/Pages/PageLayout/PageLayout';
import { getMaterials } from '@src/render/Pages/Materials/Components/MaterialsTable';
import { VALIDATION_MESSAGE_DURATION } from '@src/globalConsts';
import { LoadingError } from '@src/render/Pages/Common/LoadingError';
import { material } from '@src/server/GETqueries';
import { addActionMaterialQueryBody } from '@src/server/ADDqueries';
import { connection } from '@src/render/root';
import { appContext } from '@src/render/context';
import styles from './AddExistMaterial.module.css';

type props = {
    actionID: number;
};

type selectOption = {
    value: number;
    label: string;
    unit?: string;
};

export const AddExistMaterial: FC<props> = ({ actionID }) => {
    const { data, isError, error, isLoading } = useQuery(
        `database_materials`,
        getMaterials,
        { refetchOnWindowFocus: false }
    );

    const [selectedOption, setSelectedOption] = useState<selectOption>({
        value: -1,
        label: '',
        unit: '',
    });
    const [addMaterialForm] = Form.useForm();
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

    const materials = data as material[];

    const materialOptions: selectOption[] = materials.map((Material) => {
        return {
            value: Material.id,
            label: Material.name,
            unit: Material.unit,
        };
    });

    const searching = (text?: string, option?: selectOption) => {
        if (!text || !option) return false;
        const { label } = option;
        return label.toLowerCase().includes(text.toLowerCase());
    };

    function addMaterial() {
        const materialID = addMaterialForm.getFieldValue('materialID');
        const count = addMaterialForm.getFieldValue('count');
        if (!materialID || !count) {
            dispatchMessage({
                type: 'error',
                content: 'Укажите материал и количество',
                duration: VALIDATION_MESSAGE_DURATION,
            });
            return;
        }
        const queryBody: addActionMaterialQueryBody = {
            type: 'add',
            url: 'actionMaterial',
            params: {
                actionID: actionID,
                materialID: materialID,
                count: count,
            },
        };
        connection?.send(JSON.stringify(queryBody));
    }

    return (
        <Form
            form={addMaterialForm}
            className={styles.AddExistMaterialForm}>
            <Space.Compact
                block
                direction={'horizontal'}
                className={styles.AddExistMaterialContainer}>
                <Form.Item
                    className={styles.AddExistMaterialFormMaterialIDItem}
                    name={'materialID'}>
                    <Select
                        className={styles.AddExistMaterialInput}
                        placeholder={'Выберите материал'}
                        showSearch
                        options={materialOptions}
                        filterOption={searching}
                        onSelect={(_, option) => setSelectedOption(option)}
                    />
                </Form.Item>
                <Form.Item
                    name={'count'}
                    className={styles.AddExistMaterialFormCountItem}>
                    <InputNumber
                        className={styles.AddExistMaterialInput}
                        placeholder="К-во"
                        min={0}
                    />
                </Form.Item>
                <Input
                    placeholder={selectedOption.unit}
                    disabled
                    className={styles.AddExistMaterialUnits}
                />
                <Button
                    onClick={addMaterial}
                    className={styles.AddExistMaterialButton}>
                    Добавить материал
                </Button>
            </Space.Compact>
        </Form>
    );
};
