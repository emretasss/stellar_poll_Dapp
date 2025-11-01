'use client';

import React, { useState, useEffect } from 'react';
import { 
    StellarWalletsKit, 
    WalletNetwork, 
    allowAllModules,
    ISupportedWallet 
} from '@creit.tech/stellar-wallets-kit';
import { PlusCircle, X, Sparkles, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { getPollContract, config, getRpcServer } from '../utils/contract';
import { Contract, SorobanRpc, TransactionBuilder, xdr, nativeToScVal } from '@stellar/stellar-sdk';

// Get kit instance
let kitInstance: StellarWalletsKit | null = null;

function getKit(): StellarWalletsKit {
    // Only initialize on client side
    if (typeof window === 'undefined') {
        throw new Error('StellarWalletsKit can only be initialized on the client side');
    }
    if (!kitInstance) {
        kitInstance = new StellarWalletsKit({
            network: WalletNetwork.TESTNET,
            modules: allowAllModules(),
        });
    }
    return kitInstance;
}

export default function CreatePollPage() {
    const [kit, setKit] = useState<StellarWalletsKit | null>(null);
    
    // Initialize kit only on client side
    useEffect(() => {
        if (typeof window !== 'undefined' && !kit) {
            try {
                setKit(getKit());
            } catch (error) {
                console.error('Failed to initialize StellarWalletsKit:', error);
            }
        }
    }, [kit]);
    const [address, setAddress] = useState<string | null>(null);
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const hasCheckedRef = React.useRef(false);

    useEffect(() => {
        if (hasCheckedRef.current || !kit) return;
        
        const checkConnection = async () => {
            try {
                const currentAddress = await kit.getAddress();
                if (currentAddress?.address) {
                    setAddress(currentAddress.address);
                }
            } catch (error) {
                // Not connected
            } finally {
                hasCheckedRef.current = true;
            }
        };

        checkConnection();
    }, [kit]);

    const addOption = () => {
        if (options.length < 10) {
            setOptions([...options, '']);
        }
    };

    const removeOption = (index: number) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!address) {
            setErrorMessage('Please connect your wallet first');
            setSubmitStatus('error');
            setTimeout(() => setSubmitStatus('idle'), 3000);
            return;
        }

        if (!question.trim()) {
            setErrorMessage('Please enter a question');
            setSubmitStatus('error');
            setTimeout(() => setSubmitStatus('idle'), 3000);
            return;
        }

        const validOptions = options.filter(opt => opt.trim());
        if (validOptions.length < 2) {
            setErrorMessage('Please provide at least 2 options');
            setSubmitStatus('error');
            setTimeout(() => setSubmitStatus('idle'), 3000);
            return;
        }

        if (validOptions.length > 10) {
            setErrorMessage('Maximum 10 options allowed');
            setSubmitStatus('error');
            setTimeout(() => setSubmitStatus('idle'), 3000);
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus('idle');
        setErrorMessage('');
        
        try {
            if (!config.contractId) {
                throw new Error('Contract not deployed. Please deploy contract first and set NEXT_PUBLIC_CONTRACT_ID in .env.local');
            }

            // SDK SorobanString tipini tanımıyor, bu yüzden Contract class'ını direkt kullanıyoruz
            const server = getRpcServer();
            const contractId = config.contractId;
            const networkPassphrase = config.networkPassphrase;
            
            // Contract instance oluştur
            const contract = new Contract(contractId);
            
            // ScVal parametrelerini hazırla
            const creatorScVal = nativeToScVal(address, { type: 'address' });
            const questionScVal = nativeToScVal(question.trim(), { type: 'string' });
            
            // Array'i doğrudan nativeToScVal ile çevir (pollContract.ts'deki gibi)
            // Trim edilmiş options array'ini direkt geçiyoruz
            const trimmedOptions = validOptions.map(opt => opt.trim());
            const optionsScVal = nativeToScVal(trimmedOptions, { type: 'array', elementType: { type: 'string' } } as any);
            
            // Account bilgisini al (simulation için)
            const sourceAccount = await server.getAccount(address);
            
            // Contract call operation'ı oluştur
            const operation = contract.call(
                'create_poll',
                creatorScVal,
                questionScVal,
                optionsScVal
            );
            
            // Transaction build et
            const txBuilder = new TransactionBuilder(sourceAccount, {
                fee: '100',
                networkPassphrase: networkPassphrase,
            });
            
            txBuilder.addOperation(operation);
            txBuilder.setTimeout(30);
            
            const builtTx = txBuilder.build();
            
            // Simulate transaction
            const simulateResult = await server.simulateTransaction(builtTx);
            
            // Restore soroban data
            const restorePreamble = SorobanRpc.assembleTransaction(
                builtTx,
                simulateResult
            ).build();
            
            // Transaction'ı sign ve send için hazırla
            const txToSign = restorePreamble;
            
            // AssembledTransaction benzeri bir wrapper oluştur
            const tx = {
                signAndSend: async (options: any) => {
                    const signedTxXdr = await options.signTransaction(txToSign.toXDR());
                    // sendTransaction XDR string kabul ediyor
                    const result = await server.sendTransaction(signedTxXdr);
                    return result;
                }
            };

            // Sign and send transaction with wallet
            if (!kit) {
                throw new Error('Wallet kit not initialized. Please wait a moment and try again.');
            }
            const result = await tx.signAndSend({
                signTransaction: async (xdr: string) => {
                    const signed = await kit.signTransaction(xdr);
                    return signed.signedTxXdr;
                },
            });

            // Transaction was sent successfully (if we reach here, it was successful)
            // The result contains the transaction hash and result value
            setSubmitStatus('success');
            setQuestion('');
            setOptions(['', '']);
            // Refresh polls after a delay
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (error: any) {
            console.error('Error creating poll:', error);
            setErrorMessage(error.message || 'Failed to create poll. Please try again.');
            setSubmitStatus('error');
            setTimeout(() => setSubmitStatus('idle'), 8000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <PlusCircle className="text-white" size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Create New Poll</h2>
                        <p className="text-gray-400 text-sm mt-1">Create a decentralized poll on Stellar blockchain</p>
                    </div>
                </div>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                    <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
                        <CheckCircle className="text-emerald-400" size={20} />
                        <p className="text-emerald-400 font-medium">Poll created successfully on blockchain!</p>
                    </div>
                )}

                {submitStatus === 'error' && errorMessage && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="text-red-400 mt-0.5" size={20} />
                            <div className="flex-1">
                                <p className="text-red-400 font-medium mb-1">Error</p>
                                <p className="text-red-300 text-sm whitespace-pre-line">{errorMessage}</p>
                            </div>
                        </div>
                    </div>
                )}

                {!config.contractId && (
                    <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm font-medium">
                            ⚠️ Contract not configured. Please deploy contract and set NEXT_PUBLIC_CONTRACT_ID in .env.local
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Question Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-300">
                            Poll Question <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="e.g., What's your favorite programming language?"
                            className="w-full px-5 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-300">
                            Options <span className="text-red-400">*</span> 
                            <span className="text-gray-400 text-xs font-normal ml-2">(2-10 options)</span>
                        </label>
                        <div className="space-y-3">
                            {options.map((option, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => updateOption(index, e.target.value)}
                                            placeholder={`Option ${index + 1}`}
                                            className="w-full px-5 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium"
                                            disabled={isSubmitting}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <Sparkles size={16} className="text-gray-500" />
                                        </div>
                                    </div>
                                    {options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removeOption(index)}
                                            className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 border border-red-500/20 hover:border-red-500/40 disabled:opacity-50"
                                            disabled={isSubmitting}
                                        >
                                            <X size={20} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {options.length < 10 && (
                            <button
                                type="button"
                                onClick={addOption}
                                className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-xl transition-all duration-200 text-sm font-medium border border-gray-600/50 hover:border-gray-500/50 disabled:opacity-50"
                                disabled={isSubmitting}
                            >
                                <PlusCircle size={18} />
                                <span>Add Option</span>
                            </button>
                        )}
                        {options.length >= 10 && (
                            <p className="text-xs text-gray-500">Maximum 10 options reached</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !address || !config.contractId}
                        className="group relative w-full px-6 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] text-lg"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creating on Blockchain...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <Sparkles size={20} />
                                Create Poll on Blockchain
                            </span>
                        )}
                    </button>

                    {!address && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                            <p className="text-sm text-yellow-400 text-center font-medium">
                                ⚠️ Please connect your wallet to create a poll
                            </p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
