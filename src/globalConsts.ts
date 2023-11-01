import path from 'path';

export const SERVER_WS_PORT = 7421;
export const SERVER_HTTP_PORT = 8080;
export const SERVER_IP = `127.0.0.1`;
export const SERVER_ADRESS = `http://${SERVER_IP}:${SERVER_HTTP_PORT}`;
export const VALIDATION_MESSAGE_DURATION = 4;
export const INDEX_PATH =
    '/' + path.join(__dirname, 'index.html').replace(/\\/g, '/');

export const NO_ROOTS_RESPONSE = JSON.stringify('NO_ROOTS_RESPONSE');
