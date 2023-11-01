import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, MenuProps, Spin } from 'antd';
import { menuContractItem } from '@src/server/GETqueries';
import { useQuery } from 'react-query';
import {
    AppstoreOutlined,
    BarsOutlined,
    ClusterOutlined,
    CopyOutlined,
    DeploymentUnitOutlined,
    FileOutlined,
    ReconciliationOutlined,
    SearchOutlined,
    SettingOutlined,
    ToolOutlined,
    UsergroupAddOutlined,
} from '@ant-design/icons';
import { INDEX_PATH } from '@src/globalConsts';
import { LoadingError } from '@src/render/Pages/Common/LoadingError';
import { MenuItemType } from 'antd/es/menu/hooks/useItems';
import { WebSocketRequerst } from '@src/server/server';
import { dataListner } from '@src/render/ResponseHandler';
import { connection } from '@src/render/root';
import { getResponseHeader } from '@src/globalFunctions';
import { appContext } from '@src/render/context';
import styles from './MainMenu.module.css';

function fetchContracts() {
    return new Promise<menuContractItem[]>((resolve, reject) => {
        const request: WebSocketRequerst = {
            type: 'get',
            url: 'mainMenu',
        };
        const awaitedEventName = getResponseHeader(request);
        const resolver = dataListner<menuContractItem[]>(
            resolve,
            awaitedEventName
        );
        document.addEventListener(awaitedEventName, resolver);
        connection?.send(JSON.stringify(request));
    });
}

type MenuItems = Required<MenuProps>['items'];

export const MainMenu: FC = () => {
    const { auth } = appContext;
    const { data, isError, isLoading, error } = useQuery(
        'database_mainMenu',
        fetchContracts,
        { refetchOnWindowFocus: false }
    );

    const navigate = useNavigate();

    const routingPage: MenuItemType['onClick'] = (event) => {
        const keyPath = event.keyPath.reverse();
        switch (keyPath[0]) {
            case 'Contracts':
                if (keyPath[1] === 'ContractsSettings') {
                    navigate(`${INDEX_PATH}/ContractsSettings`);
                    break;
                } else if (keyPath[1] === 'Searching') {
                    navigate(`${INDEX_PATH}/Searching`);
                    break;
                }
                navigate(`${INDEX_PATH}/Repair/${keyPath[1]}`);
                break;
            case 'Settings':
                navigate(`${INDEX_PATH}/${keyPath[1]}`);
            case 'DataBase':
                navigate(`${INDEX_PATH}/${keyPath[1]}`);
            default:
                break;
        }
    };

    if (isError) {
        return <LoadingError error={error} />;
    }
    if (isLoading) {
        return <Spin />;
    }
    if (!data) {
        return <div />;
    }

    let contracts = data.filter(
        (Contntract) => Contntract.id
    ) as menuContractItem[];

    const contractsItems: MenuItems = contracts.map((contract) => {
        const { name, number, id } = contract;
        return {
            key: id,
            label: `${name} №... ${[...number]
                .reverse()
                .slice(0, 5)
                .reverse()
                .join('')}`,
            icon: null,
            onClick: routingPage,
        };
    });

    const items: MenuItems = [
        {
            key: 'UnitContracts',
            label: 'Единичный ремонт',
            icon: <FileOutlined />,
            onClick: routingPage,
        },
        {
            key: 'Contracts',
            label: 'Договоры',
            style: { whiteSpace: 'normal', wordWrap: 'break-word' },
            icon: <BarsOutlined />,
            onClick: routingPage,
            children: [
                {
                    key: 'Searching',
                    label: 'Поиск',
                    icon: <SearchOutlined />,
                },
                auth.roots === 'watcher'
                    ? null
                    : {
                          key: 'ContractsSettings',
                          label: 'Управление договорами',
                          icon: <CopyOutlined />,
                      },
                {
                    key: 0,
                    label: 'Ед. договора',
                    icon: null,
                },
                ...contractsItems,
            ],
        },
        {
            key: 'DataBase',
            label: 'База данных',
            icon: <ReconciliationOutlined />,
            style: { whiteSpace: 'normal', wordWrap: 'break-word' },
            children: [
                {
                    key: 'Devices',
                    label: 'Изделия',
                    icon: <AppstoreOutlined />,
                    onClick: routingPage,
                },
                {
                    key: 'Defects',
                    label: 'Неисправности',
                    icon: <ToolOutlined />,
                    onClick: routingPage,
                },
                {
                    key: 'Materials',
                    label: 'Материалы (ПКИ)',
                    icon: <DeploymentUnitOutlined />,
                    onClick: routingPage,
                },
            ],
        },
        auth.roots === 'admin'
            ? {
                  key: 'Settings',
                  label: 'Настройки',
                  icon: <SettingOutlined />,
                  style: { whiteSpace: 'normal', wordWrap: 'break-word' },
                  children: [
                      {
                          key: 'Users',
                          label: 'Пользователи',
                          icon: <UsergroupAddOutlined />,
                          onClick: routingPage,
                      },
                      {
                          key: 'ServerSettings',
                          label: 'Настройки сервера',
                          icon: <ClusterOutlined />,
                          onClick: routingPage,
                      },
                  ],
              }
            : null,
    ];
    return (
        <Menu
            mode={'inline'}
            items={items}
            className={styles.MainMenu}
        />
    );
};
