import webpack from 'webpack';
import {
    serverCommon,
    mainCommon,
    renderCommon,
} from './webpack.config.common';

const server: webpack.Configuration = {
    ...serverCommon,
    mode: 'development',
};

const main: webpack.Configuration = {
    ...mainCommon,
    mode: 'development',
};

const render: webpack.Configuration = {
    ...renderCommon,
    mode: 'development',
};

export default [main, server, render];
