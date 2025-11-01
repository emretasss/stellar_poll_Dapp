import { create } from 'zustand';

interface State {
    walletAddress: string | null;
    contractId: string | null;
    polls: Poll[];
}

interface Poll {
    id: number;
    question: string;
    options: string[];
    votes: number[];
    creator: string;
    isActive: boolean;
}

interface Actions {
    setWalletAddress: (address: string | null) => void;
    setContractId: (id: string | null) => void;
    setPolls: (polls: Poll[]) => void;
    addPoll: (poll: Poll) => void;
    updatePoll: (pollId: number, votes: number[]) => void;
}

export const useStore = create<State & Actions>((set) => ({
    walletAddress: null,
    contractId: null,
    polls: [],
    setWalletAddress: (address) => set(() => ({ walletAddress: address })),
    setContractId: (id) => set(() => ({ contractId: id })),
    setPolls: (polls) => set(() => ({ polls })),
    addPoll: (poll) => set((state) => ({ polls: [...state.polls, poll] })),
    updatePoll: (pollId, votes) => set((state) => ({
        polls: state.polls.map(p => p.id === pollId ? { ...p, votes } : p)
    })),
}));



