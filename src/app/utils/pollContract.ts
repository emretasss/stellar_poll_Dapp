import { Contract, SorobanRpc, Networks, TransactionBuilder, xdr, scValToNative, nativeToScVal } from '@stellar/stellar-sdk';
import { Server } from '@stellar/stellar-sdk';

export interface Poll {
    id: number;
    question: string;
    options: string[];
    votes: number[];
    creator: string;
    created_at: number;
    is_active: boolean;
}

export class PollContract {
    private contract: Contract;
    private server: Server;
    private networkPassphrase: string;

    constructor(contractId: string, rpcUrl: string, networkPassphrase: string) {
        this.contract = new Contract(contractId);
        this.server = new Server(rpcUrl);
        this.networkPassphrase = networkPassphrase;
    }

    /**
     * Create a new poll
     */
    async createPoll(
        sourceKeypair: { publicKey: () => string; secret: () => string },
        question: string,
        options: string[]
    ): Promise<number> {
        if (options.length < 2 || options.length > 10) {
            throw new Error('Options must be between 2 and 10');
        }

        const sourceAccount = await this.server.getAccount(sourceKeypair.publicKey());
        
        const txBuilder = new TransactionBuilder(sourceAccount, {
            fee: '100',
            networkPassphrase: this.networkPassphrase,
        });

        const questionScVal = nativeToScVal(question, { type: 'string' });
        const optionsScVal = nativeToScVal(options, { type: 'array', elementType: { type: 'string' } });

        const operation = this.contract.call(
            'create_poll',
            nativeToScVal(sourceKeypair.publicKey(), { type: 'address' }),
            questionScVal,
            optionsScVal
        );

        txBuilder.addOperation(operation);
        txBuilder.setTimeout(30);

        const tx = txBuilder.build();

        // Sign transaction
        const signedTx = tx.sign(sourceKeypair.secret());
        
        // Submit transaction
        const result = await this.server.sendTransaction(signedTx);
        
        if (result.status === 'SUCCESS' && result.resultXdr) {
            const txResult = SorobanRpc.getTransaction(result);
            const returnValue = txResult.result?.retval;
            if (returnValue) {
                return scValToNative(returnValue);
            }
        }

        throw new Error('Failed to create poll');
    }

    /**
     * Vote on a poll
     */
    async vote(
        sourceKeypair: { publicKey: () => string; secret: () => string },
        pollId: number,
        optionIndex: number
    ): Promise<boolean> {
        const sourceAccount = await this.server.getAccount(sourceKeypair.publicKey());
        
        const txBuilder = new TransactionBuilder(sourceAccount, {
            fee: '100',
            networkPassphrase: this.networkPassphrase,
        });

        const operation = this.contract.call(
            'vote',
            nativeToScVal(sourceKeypair.publicKey(), { type: 'address' }),
            nativeToScVal(pollId, { type: 'u32' }),
            nativeToScVal(optionIndex, { type: 'u32' })
        );

        txBuilder.addOperation(operation);
        txBuilder.setTimeout(30);

        const tx = txBuilder.build();
        const signedTx = tx.sign(sourceKeypair.secret());
        
        const result = await this.server.sendTransaction(signedTx);
        
        if (result.status === 'SUCCESS') {
            return true;
        }

        return false;
    }

    /**
     * Get poll details
     */
    async getPoll(pollId: number): Promise<Poll> {
        const result = await this.server.callContract(
            this.contract.contractId(),
            'get_poll',
            nativeToScVal(pollId, { type: 'u32' })
        );

        if (result.result) {
            const pollData = scValToNative(result.result.retval);
            return this.parsePoll(pollData);
        }

        throw new Error('Failed to get poll');
    }

    /**
     * Get poll results
     */
    async getPollResults(pollId: number): Promise<number[]> {
        const result = await this.server.callContract(
            this.contract.contractId(),
            'get_results',
            nativeToScVal(pollId, { type: 'u32' })
        );

        if (result.result) {
            return scValToNative(result.result.retval);
        }

        throw new Error('Failed to get poll results');
    }

    /**
     * Get total poll count
     */
    async getPollCount(): Promise<number> {
        const result = await this.server.callContract(
            this.contract.contractId(),
            'get_poll_count',
            xdr.ScVal.scvVoid()
        );

        if (result.result) {
            return scValToNative(result.result.retval);
        }

        return 0;
    }

    /**
     * Check if address has voted
     */
    async hasVoted(pollId: number, voterAddress: string): Promise<boolean> {
        const result = await this.server.callContract(
            this.contract.contractId(),
            'has_voted',
            nativeToScVal(pollId, { type: 'u32' }),
            nativeToScVal(voterAddress, { type: 'address' })
        );

        if (result.result) {
            return scValToNative(result.result.retval);
        }

        return false;
    }

    /**
     * Get all poll IDs
     */
    async getAllPollIds(): Promise<number[]> {
        const result = await this.server.callContract(
            this.contract.contractId(),
            'get_all_poll_ids',
            xdr.ScVal.scvVoid()
        );

        if (result.result) {
            return scValToNative(result.result.retval);
        }

        return [];
    }

    /**
     * Parse poll data from contract response
     */
    private parsePoll(data: any): Poll {
        return {
            id: Number(data.id || 0),
            question: String(data.question || ''),
            options: Array.isArray(data.options) ? data.options.map((opt: any) => String(opt)) : [],
            votes: Array.isArray(data.votes) ? data.votes.map((v: any) => Number(v || 0)) : [],
            creator: String(data.creator || ''),
            created_at: Number(data.created_at || 0),
            is_active: Boolean(data.is_active),
        };
    }
}



