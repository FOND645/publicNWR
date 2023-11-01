import webpack from 'webpack';
import {
    serverCommon,
    mainCommon,
    renderCommon,
} from './webpack.config.common';

const server: webpack.Configuration = {
    ...serverCommon,
    mode: 'production',
};

const main: webpack.Configuration = {
    ...mainCommon,
    mode: 'production',
};

const render: webpack.Configuration = {
    ...renderCommon,
    mode: 'production',
};

export default [main, server, render];
