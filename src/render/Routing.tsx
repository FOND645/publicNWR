import React, { FC } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { PageLayout } from './Pages/PageLayout/PageLayout';
import { Defects } from './Pages/Defects/Defects';
import { Materials } from './Pages/Materials/Materials';
import { Devices } from './Pages/Devices/Devices';
import { Repair } from './Pages/Repair/Repair';
import { ContractsSettings } from './Pages/ContractsSettings/ContractsSettings';
import { Users } from './Pages/Settings/Users/Users';
import { ServerSettings } from './Pages/Settings/ServerSettings/Settings';

import { INDEX_PATH } from '@src/globalConsts';
import { Searching } from './Pages/Searching/Searching';

type props = {};

export const Routing: FC<props> = ({}) => {
    return (
        <Router>
            <Routes>
                <Route
                    path={INDEX_PATH}
                    element={<PageLayout />}>
                    <Route
                        index
                        element={<div />}
                    />
                    <Route
                        path="Materials"
                        element={<Materials />}
                    />
                    <Route
                        path="Defects"
                        element={<Defects />}
                    />
                    <Route
                        path="Devices"
                        element={<Devices />}
                    />
                    <Route
                        path="Repair/:contractID"
                        element={<Repair />}
                    />
                    <Route
                        path="ContractsSettings"
                        element={<ContractsSettings />}
                    />
                    <Route
                        path="Users"
                        element={<Users />}
                    />
                    <Route
                        path="ServerSettings"
                        element={<ServerSettings />}
                    />
                    <Route
                        path="Searching"
                        element={<Searching />}
                    />
                </Route>
            </Routes>
        </Router>
    );
};
