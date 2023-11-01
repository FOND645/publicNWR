import React, { Dispatch, FC, SetStateAction } from 'react';
import { blockToSelect } from '@src/server/GETqueries';
import { Form, Select, Spin } from 'antd';
import { useQuery } from 'react-query';
import { LoadingError } from '@src/render/Pages/Common/LoadingError';
import { dataListner } from '@src/render/ResponseHandler';
import { WebSocketRequerst } from '@src/server/server';
import { connection } from '@src/render/root';
import { getResponseHeader } from '@src/globalFunctions';
import styles from './SelectBlock.module.css';

export interface Option {
    value: string | number;
    decimal: string;
    label: React.ReactNode;
    disabled?: boolean;
}

export function getBlocks() {
    return new Promise<blockToSelect[]>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'blocksForSelect',
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<blockToSelect[]>(
            resolve,
            awaitedEventName
        );
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

type props = {
    isEditing: boolean;
    setCurrentDecimal: Dispatch<SetStateAction<string>>;
    blockID: number;
};

export const SelectBlock: FC<props> = ({
    setCurrentDecimal,
    blockID,
    isEditing,
}) => {
    const { data, isError, isLoading, error } = useQuery(
        `database_blocks`,
        getBlocks,
        { refetchOnWindowFocus: false }
    );
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

    const selectHandler = (value: never, option: Option | Option[]) => {
        if (!Array.isArray(option)) {
            setCurrentDecimal(option.decimal);
        }
    };

    const options = blocks.map((block) => {
        const option: Option = {
            value: block.block_id,
            decimal: block.decimal,
            label: `${block.is_leading ? '=> ' : ''} ${block.name}`,
        };
        return option;
    });

    return (
        <Form.Item
            name={'blockID'}
            className={styles.SelectBlockFormItem}
            initialValue={blockID}>
            {isEditing ? (
                <Select
                    options={options}
                    className={styles.SelectBlockSelect}
                    onChange={selectHandler}
                    size="small"
                />
            ) : (
                options.find((Option) => Option.value === blockID)?.label
            )}
        </Form.Item>
    );
};
