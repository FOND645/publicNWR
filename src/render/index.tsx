import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { Root } from './root';
import { QueryClient, QueryClientProvider } from 'react-query';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

export const qureyClient = new QueryClient();

root.render(
    <React.StrictMode>
        <QueryClientProvider client={qureyClient}>
            <Root />
        </QueryClientProvider>
    </React.StrictMode>
);
