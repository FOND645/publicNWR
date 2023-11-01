import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';

const commonCongiguration: webpack.Configuration = {
    resolve: {
        extensions: [`.ts`, `.tsx`, `.js`, `.jsx`, '.svg'],
        modules: ['public', 'src', 'node_modules'],
        alias: {
            '@src': path.resolve(__dirname, 'src'),
            '@public': path.resolve(__dirname, 'public'),
        },
    },
    output: {
        filename: '[name].js', // Имя выходного файла
        path: path.resolve(__dirname, 'dist'), // Папка для выходных файлов
    },
    module: {
        rules: [
            {
                test: /\.cs$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.html$/,
                include: /node_modules/,
                use: ['html-loader'], // Используем html-loader для обработки HTML файлов
            },
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: 'ts-loader',
            },
            {
                test: /\.(scss)$/,
                include: path.resolve(__dirname, 'src'),
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
            {
                test: /\.(css)$/,
                include: path.resolve(__dirname, 'src', 'render'),
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
            {
                test: /\.(css)$/,
                include: path.resolve(__dirname, 'public'),
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
            {
                test: /\.(svg|png)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'images/', // Папка, куда будут скопированы файлы
                        },
                    },
                ],
            },
        ],
    },
};

export const serverCommon: webpack.Configuration = {
    ...commonCongiguration,
    mode: 'development',
    externals: {
        sqlite3: 'commonjs sqlite3',
        electron: 'commonjs electron',
    },
    entry: {
        main: './src/server/server.ts',
    },
    output: {
        filename: '[name].js', // Имя выходного файла
        path: path.resolve(__dirname, 'dist', 'server'), // Папка для выходных файлов
    },
    target: 'node',
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public/auth.db', to: 'auth.db' },
                { from: 'public/NWR.db', to: 'NWR.db' },
                { from: 'public/server_settings.json', to: 'settings.json' },
                { from: 'public/server_package.json', to: 'package.json' },
            ],
        }),
    ],
};

export const mainCommon: webpack.Configuration = {
    ...commonCongiguration,
    entry: {
        main: './src/main/main.ts',
    },
    output: {
        filename: '[name].js', // Имя выходного файла
        path: path.resolve(__dirname, 'dist', 'app'), // Папка для выходных файлов
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public/app_settings.json', to: 'settings.json' },
                { from: 'public/app_package.json', to: 'package.json' },
            ],
        }),
    ],
    target: 'electron-main',
};

export const renderCommon: webpack.Configuration = {
    ...commonCongiguration,
    entry: {
        render: `./src/render/index.tsx`,
    },
    output: {
        filename: '[name].js', // Имя выходного файла
        path: path.resolve(__dirname, 'dist', 'app'), // Папка для выходных файлов
    },
    target: 'electron-renderer',
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
        }),
    ],
};
