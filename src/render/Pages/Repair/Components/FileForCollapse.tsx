import React, { FC } from 'react';
import { useQuery } from 'react-query';
import { getFilesList } from './PhotoForCollapse';
import { LoadingError } from '../../Common/LoadingError';
import { Space, Spin, Typography } from 'antd';
import path from 'path';
import {
    FileImageFilled,
    FileTextFilled,
    FileUnknownFilled,
} from '@ant-design/icons';
const { Link } = Typography;
type props = {
    contractID: number;
    repairDeviceID: number;
    type: 'mail' | 'contract';
    isUnit: boolean;
};

export const FileForCollapse: FC<props> = ({
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
    const imgExtensions = ['.png', '.jpeg', '.jpg'];
    const docsExtensions = ['.pdf', '.tiff', '.doc', '.docx'];
    const links = data.map((FilePath) => {
        let type = 'unknown';
        if (imgExtensions.some((Ext) => FilePath.endsWith(Ext))) type = 'image';
        if (docsExtensions.some((Ext) => FilePath.endsWith(Ext))) type = 'doc';
        return {
            path: FilePath,
            type: type,
        };
    });
    return (
        <>
            {links.forEach((FileLink) => (
                <Space.Compact direction="horizontal">
                    {links.length === 0 ? (
                        `Нет документов`
                    ) : FileLink.type === 'image' ? (
                        <FileImageFilled />
                    ) : FileLink.type === 'doc' ? (
                        <FileTextFilled />
                    ) : (
                        <FileUnknownFilled />
                    )}
                    <Link>{path.basename(FileLink.path)}</Link>
                </Space.Compact>
            ))}
        </>
    );
};
