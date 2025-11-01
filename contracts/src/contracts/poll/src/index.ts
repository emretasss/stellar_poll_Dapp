import { Buffer } from "buffer";
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk'
export * as contract from '@stellar/stellar-sdk/contract'
export * as rpc from '@stellar/stellar-sdk/rpc'

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CCZXJYJD7UC26YYJWEYLWSSUOE5ERHD3VXMMM3GD7OI4T3JUGAA23XBM",
  }
} as const


export interface Poll {
  created_at: u64;
  creator: string;
  id: u32;
  is_active: boolean;
  options: Array<SorobanString>;
  question: SorobanString;
  votes: Array<u32>;
}

export interface Client {
  /**
   * Construct and simulate a vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Vote on a poll
   */
  vote: ({voter, poll_id, option_index}: {voter: string, poll_id: u32, option_index: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a get_poll transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get poll details
   */
  get_poll: ({poll_id}: {poll_id: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Poll>>

  /**
   * Construct and simulate a has_voted transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Check if address has voted
   */
  has_voted: ({poll_id, voter}: {poll_id: u32, voter: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a close_poll transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Close a poll (only creator can close)
   */
  close_poll: ({creator, poll_id}: {creator: string, poll_id: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initialize the contract
   */
  initialize: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a create_poll transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Create a new poll
   */
  create_poll: ({creator, question, options}: {creator: string, question: SorobanString, options: Array<SorobanString>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a get_results transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get poll results
   */
  get_results: ({poll_id}: {poll_id: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<u32>>>

  /**
   * Construct and simulate a get_poll_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get total poll count
   */
  get_poll_count: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a get_all_poll_ids transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all poll IDs (for listing)
   */
  get_all_poll_ids: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<u32>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAAAAAA5Wb3RlIG9uIGEgcG9sbAAAAAAABHZvdGUAAAADAAAAAAAAAAV2b3RlcgAAAAAAABMAAAAAAAAAB3BvbGxfaWQAAAAABAAAAAAAAAAMb3B0aW9uX2luZGV4AAAABAAAAAEAAAAB",
        "AAAAAQAAAAAAAAAAAAAABFBvbGwAAAAHAAAAAAAAAApjcmVhdGVkX2F0AAAAAAAGAAAAAAAAAAdjcmVhdG9yAAAAABMAAAAAAAAAAmlkAAAAAAAEAAAAAAAAAAlpc19hY3RpdmUAAAAAAAABAAAAAAAAAAdvcHRpb25zAAAAA+oAAAfQAAAADVNvcm9iYW5TdHJpbmcAAAAAAAAAAAAACHF1ZXN0aW9uAAAH0AAAAA1Tb3JvYmFuU3RyaW5nAAAAAAAAAAAAAAV2b3RlcwAAAAAAA+oAAAAE",
        "AAAAAAAAABBHZXQgcG9sbCBkZXRhaWxzAAAACGdldF9wb2xsAAAAAQAAAAAAAAAHcG9sbF9pZAAAAAAEAAAAAQAAB9AAAAAEUG9sbA==",
        "AAAAAAAAABpDaGVjayBpZiBhZGRyZXNzIGhhcyB2b3RlZAAAAAAACWhhc192b3RlZAAAAAAAAAIAAAAAAAAAB3BvbGxfaWQAAAAABAAAAAAAAAAFdm90ZXIAAAAAAAATAAAAAQAAAAE=",
        "AAAAAAAAACVDbG9zZSBhIHBvbGwgKG9ubHkgY3JlYXRvciBjYW4gY2xvc2UpAAAAAAAACmNsb3NlX3BvbGwAAAAAAAIAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAAHcG9sbF9pZAAAAAAEAAAAAQAAAAE=",
        "AAAAAAAAABdJbml0aWFsaXplIHRoZSBjb250cmFjdAAAAAAKaW5pdGlhbGl6ZQAAAAAAAAAAAAA=",
        "AAAAAAAAABFDcmVhdGUgYSBuZXcgcG9sbAAAAAAAAAtjcmVhdGVfcG9sbAAAAAADAAAAAAAAAAdjcmVhdG9yAAAAABMAAAAAAAAACHF1ZXN0aW9uAAAH0AAAAA1Tb3JvYmFuU3RyaW5nAAAAAAAAAAAAAAdvcHRpb25zAAAAA+oAAAfQAAAADVNvcm9iYW5TdHJpbmcAAAAAAAABAAAABA==",
        "AAAAAAAAABBHZXQgcG9sbCByZXN1bHRzAAAAC2dldF9yZXN1bHRzAAAAAAEAAAAAAAAAB3BvbGxfaWQAAAAABAAAAAEAAAPqAAAABA==",
        "AAAAAAAAABRHZXQgdG90YWwgcG9sbCBjb3VudAAAAA5nZXRfcG9sbF9jb3VudAAAAAAAAAAAAAEAAAAE",
        "AAAAAAAAAB5HZXQgYWxsIHBvbGwgSURzIChmb3IgbGlzdGluZykAAAAAABBnZXRfYWxsX3BvbGxfaWRzAAAAAAAAAAEAAAPqAAAABA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    vote: this.txFromJSON<boolean>,
        get_poll: this.txFromJSON<Poll>,
        has_voted: this.txFromJSON<boolean>,
        close_poll: this.txFromJSON<boolean>,
        initialize: this.txFromJSON<null>,
        create_poll: this.txFromJSON<u32>,
        get_results: this.txFromJSON<Array<u32>>,
        get_poll_count: this.txFromJSON<u32>,
        get_all_poll_ids: this.txFromJSON<Array<u32>>
  }
}