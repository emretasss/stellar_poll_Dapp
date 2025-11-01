"use client";
import { PasskeyKit, PasskeyServer } from "passkey-kit";

let _account: PasskeyKit | null = null;
let _server: PasskeyServer | null = null;

function getEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} environment variable is not set`);
    }
    return value;
}

function getAccount(): PasskeyKit {
    if (!_account) {
        try {
            _account = new PasskeyKit({
                rpcUrl: getEnvVar("NEXT_PUBLIC_RPC_URL"),
                networkPassphrase: getEnvVar("NEXT_PUBLIC_NETWORK_PASSPHRASE"),
                walletWasmHash: getEnvVar("NEXT_PUBLIC_WALLET_WASM_HASH"),
                timeoutInSeconds: 30,
            });
        } catch (error) {
            console.error("Failed to initialize PasskeyKit:", error);
            throw error;
        }
    }
    return _account;
}

function getServer(): PasskeyServer {
    if (!_server) {
        try {
            _server = new PasskeyServer({
                rpcUrl: getEnvVar("NEXT_PUBLIC_RPC_URL"),
                launchtubeUrl: getEnvVar("NEXT_PUBLIC_LAUNCHTUBE_URL"),
                launchtubeJwt: getEnvVar("NEXT_PUBLIC_LAUNCHTUBE_JWT"),
            });
        } catch (error) {
            console.error("Failed to initialize PasskeyServer:", error);
            throw error;
        }
    }
    return _server;
}

// Lazy initialization - only initialize when accessed
export const account = new Proxy({} as PasskeyKit, {
    get(target, prop) {
        const instance = getAccount();
        const value = instance[prop as keyof PasskeyKit];
        if (typeof value === 'function') {
            return value.bind(instance);
        }
        return value;
    }
});

export const server = new Proxy({} as PasskeyServer, {
    get(target, prop) {
        const instance = getServer();
        const value = instance[prop as keyof PasskeyServer];
        if (typeof value === 'function') {
            return value.bind(instance);
        }
        return value;
    }
});