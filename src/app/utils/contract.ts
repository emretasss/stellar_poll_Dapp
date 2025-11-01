import { Client as PollClient, networks } from '../../contracts/poll/src';
import { SorobanRpc } from '@stellar/stellar-sdk';

const config = {
    // RPC URL - trailing slash olmadan
    rpcUrl: (process.env.NEXT_PUBLIC_RPC_URL || 'https://soroban-testnet.stellar.org').replace(/\/$/, ''),
    networkPassphrase: process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
    contractId: process.env.NEXT_PUBLIC_CONTRACT_ID || '',
};

let contractClient: PollClient | null = null;
let rpcServer: SorobanRpc.Server | null = null;

export function getRpcServer(): SorobanRpc.Server {
    if (!rpcServer) {
        if (!config.rpcUrl) {
            throw new Error('NEXT_PUBLIC_RPC_URL environment variable is not set');
        }
        rpcServer = new SorobanRpc.Server(config.rpcUrl);
    }
    return rpcServer;
}

export function getPollContract(): PollClient {
    if (!contractClient) {
        if (!config.contractId) {
            throw new Error('NEXT_PUBLIC_CONTRACT_ID environment variable is not set. Please deploy contract first.');
        }
        if (!config.rpcUrl) {
            throw new Error('NEXT_PUBLIC_RPC_URL environment variable is not set');
        }
        
        contractClient = new PollClient({
            contractId: config.contractId,
            networkPassphrase: config.networkPassphrase,
            rpcUrl: config.rpcUrl,
        });
    }
    return contractClient;
}

export { config };
