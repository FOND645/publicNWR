import { getResponseHeader } from '@src/globalFunctions';
import { dataListner } from '@src/render/ResponseHandler';
import { connection } from '@src/render/root';
import { WebSocketRequerst } from '@src/server/server';
import React, { FC } from 'react';
import { useQuery } from 'react-query';
import { LoadingError } from '../../Common/LoadingError';
import { Image, Spin } from 'antd';
import { appContext } from '@src/render/context';
import styles from './PhotoForCollapse.module.css';

type props = {
    contractID: number;
    repairDeviceID: number;
    type: 'note' | 'photo';
};

export function getFilesList(
    contractID: number,
    repairDeviceID: number,
    type: 'note' | 'mail' | 'contract' | 'photo'
) {
    return new Promise<string[]>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'filesList',
            targetID: `${type}|${contractID}|${repairDeviceID}`,
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<string[]>(resolve, awaitedEventName);
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

export const PhotoForCollapse: FC<props> = ({
    contractID,
    repairDeviceID,
    type,
}) => {
    const { data, isError, error, isLoading } = useQuery(
        `get_imageList_${type}|${contractID}|${repairDeviceID}_repsonse`,
        () => getFilesList(contractID, repairDeviceID, type),
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

    console.log(data);

    return (
        <>
            {data.length === 0
                ? 'Нет файлов'
                : data.map((ImgPath) => (
                      <Image
                          src={`http://${appContext.settings?.serverIP}:8080/image/${type}/${contractID}/${repairDeviceID}/${ImgPath}`}
                          className={styles.PhotoForCollapse}
                      />
                  ))}
        </>
    );
};
