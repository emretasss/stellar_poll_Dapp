import { Client } from 'chat-demo-sdk';

let _chat: Client | null = null;

function getEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} environment variable is not set`);
    }
    return value;
}

function getChat(): Client {
    if (!_chat) {
        try {
            _chat = new Client({
                rpcUrl: getEnvVar("NEXT_PUBLIC_RPC_URL"),
                contractId: getEnvVar("NEXT_PUBLIC_CHAT_CONTRACT_ID"),
                networkPassphrase: getEnvVar("NEXT_PUBLIC_NETWORK_PASSPHRASE"),
            });
        } catch (error) {
            console.error("Failed to initialize Chat Client:", error);
            throw error;
        }
    }
    return _chat;
}

// Lazy initialization - only initialize when accessed
export const chat = new Proxy({} as Client, {
    get(target, prop) {
        const instance = getChat();
        const value = instance[prop as keyof Client];
        if (typeof value === 'function') {
            return value.bind(instance);
        }
        return value;
    }
});
