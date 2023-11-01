export type authParams = {
    login: string;
    password: string;
};

export interface WebSocketError {
    type: 'error';
    message?: string;
    error: { [key: string]: any };
}
