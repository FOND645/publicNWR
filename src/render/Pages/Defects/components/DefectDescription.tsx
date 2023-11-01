import React, { FC, useState } from 'react';
import { useQuery } from 'react-query';
import { defectForDescription } from '@src/server/GETqueries';
import { Col, Divider, Form, Row, Spin, Typography } from 'antd';
import { EditDescrButtons } from './EditDescrButtons';
import { DefectDescriptionField } from './DefectDescriptionField';
import { SelectBlock } from './SelectBlock';
import { LoadingError } from '@src/render/Pages/Common/LoadingError';
import { WebSocketRequerst } from '@src/server/server';
import { dataListner } from '@src/render/ResponseHandler';
import { connection } from '@src/render/root';
import { getResponseHeader } from '@src/globalFunctions';
import styles from './DefectDescription.module.css';

const { Text } = Typography;

type props = {
    defectID: number;
};

function fetchDefectDescription(defectID: number) {
    return new Promise<[defectForDescription] | []>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'defectDetails',
            targetID: defectID,
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<[defectForDescription] | []>(
            resolve,
            awaitedEventName
        );
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const DefectDescription: FC<props> = ({ defectID }) => {
    const { data, isError, isLoading, error } = useQuery(
        `database_defect_details${defectID}`,
        () => fetchDefectDescription(defectID),
        { refetchOnWindowFocus: false }
    );

    const [isEditing, setEditing] = useState<boolean>(false);
    const [currentDecimal, setCurrentDecimal] = useState<string>('');
    const [defectDescriptionForm] = Form.useForm();

    if (isError) {
        return <LoadingError error={error} />;
    }
    if (isLoading) {
        return <Spin />;
    }
    if (!data || data.length === 0) {
        return <div />;
    }

    const [defectDesctription] = data as [defectForDescription];

    const { decimal, block_id } = defectDesctription;
    if (currentDecimal === '') {
        setCurrentDecimal(decimal);
    }

    const startEditing: React.MouseEventHandler<HTMLElement> = () => {
        setEditing(true);
    };

    const discardChanges = () => {
        setCurrentDecimal(decimal);
        setEditing(false);
    };

    return (
        <Form form={defectDescriptionForm}>
            <Divider
                children={
                    <EditDescrButtons
                        Form={defectDescriptionForm}
                        isEditing={isEditing}
                        startEditing={startEditing}
                        discardChanges={discardChanges}
                        defectID={defectID}
                    />
                }
                orientation="left"
            />
            <Row
                className={styles.DefectDescriptionRow}
                align={'middle'}>
                <Col span={4}>
                    <Text strong>Изделие:</Text>
                </Col>
                <Col span={12}>
                    <SelectBlock
                        blockID={block_id}
                        setCurrentDecimal={setCurrentDecimal}
                        isEditing={isEditing}
                    />
                </Col>
            </Row>
            <Row
                className={styles.DefectDescriptionRow}
                align={'middle'}>
                <Col span={4}>
                    <Text strong>Децимальный номер:</Text>
                </Col>
                <Col span={12}>{currentDecimal}</Col>
            </Row>
            <Row
                className={styles.DefectDescriptionRow}
                align={'middle'}>
                <Col span={4}>
                    <Text strong>Краткое описание:</Text>
                </Col>
                <Col span={12}>
                    <DefectDescriptionField
                        isEditing={isEditing}
                        data={defectDesctription}
                        field={'description'}
                    />
                </Col>
            </Row>
            <Row
                className={styles.DefectDescriptionRow}
                align={'middle'}>
                <Col span={4}>
                    <Text strong>Описание дефекта:</Text>
                </Col>
                <Col span={12}>
                    <DefectDescriptionField
                        isEditing={isEditing}
                        data={defectDesctription}
                        field={'defect'}
                    />
                </Col>
            </Row>
            <Row
                className={styles.DefectDescriptionRow}
                align={'middle'}>
                <Col span={4}>
                    <Text strong>Решение по дефекту:</Text>
                </Col>
                <Col span={12}>
                    <DefectDescriptionField
                        isEditing={isEditing}
                        data={defectDesctription}
                        field={'solution'}
                    />
                </Col>
            </Row>
        </Form>
    );
};
