#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, vec, Env, Vec, String as SorobanString, Address};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Poll {
    pub id: u32,
    pub question: SorobanString,
    pub options: Vec<SorobanString>,
    pub votes: Vec<u32>,
    pub creator: Address,
    pub created_at: u64,
    pub is_active: bool,
}

#[contract]
pub struct PollContract;

#[contractimpl]
impl PollContract {
    /// Initialize the contract
    pub fn initialize(_env: Env) {
        // Contract initialized
    }

    /// Create a new poll
    pub fn create_poll(
        env: Env,
        creator: Address,
        question: SorobanString,
        options: Vec<SorobanString>,
    ) -> u32 {
        creator.require_auth();
        
        if options.len() < 2 || options.len() > 10 {
            panic!("Options must be between 2 and 10");
        }
        
        // Get next poll ID
        let next_id_key = symbol_short!("NEXT_ID");
        let next_id: u32 = env
            .storage()
            .persistent()
            .get(&next_id_key)
            .unwrap_or(0u32);
        let poll_id = next_id + 1;
        
        // Initialize votes vector with zeros
        let options_len = options.len();
        let mut votes = vec![&env];
        for _ in 0..options_len {
            votes.push_back(0u32);
        }
        
        // Create poll
        let poll = Poll {
            id: poll_id,
            question: question.clone(),
            options: options.clone(),
            votes,
            creator: creator.clone(),
            created_at: env.ledger().timestamp(),
            is_active: true,
        };
        
        // Store poll
        let poll_key = symbol_short!("POLL");
        env.storage()
            .persistent()
            .set(&(poll_key, poll_id), &poll);
        
        // Update next ID
        env.storage()
            .persistent()
            .set(&next_id_key, &poll_id);
        
        poll_id
    }

    /// Vote on a poll
    pub fn vote(
        env: Env,
        voter: Address,
        poll_id: u32,
        option_index: u32,
    ) -> bool {
        voter.require_auth();
        
        // Check if already voted
        let vote_key = symbol_short!("VOTE");
        let has_voted: bool = env
            .storage()
            .persistent()
            .get(&(vote_key.clone(), poll_id, &voter))
            .unwrap_or(false);
        
        if has_voted {
            return false;
        }
        
        // Get poll
        let poll_key = symbol_short!("POLL");
        let poll: Poll = env
            .storage()
            .persistent()
            .get(&(poll_key.clone(), poll_id))
            .unwrap_or_else(|| panic!("Poll not found"));
        
        if !poll.is_active {
            return false;
        }
        
        if option_index >= poll.options.len() {
            return false;
        }
        
        // Create new votes vector with updated count
        let mut new_votes_vec = vec![&env];
        for i in 0..poll.votes.len() {
            let current_votes = poll.votes.get(i).unwrap_or(0u32);
            if i == option_index {
                new_votes_vec.push_back(current_votes + 1);
            } else {
                new_votes_vec.push_back(current_votes);
            }
        }
        
        // Create updated poll
        let updated_poll = Poll {
            votes: new_votes_vec,
            ..poll
        };
        
        // Store updated poll
        env.storage()
            .persistent()
            .set(&(poll_key, poll_id), &updated_poll);
        
        // Mark as voted
        env.storage()
            .persistent()
            .set(&(vote_key, poll_id, &voter), &true);
        
        true
    }

    /// Get poll details
    pub fn get_poll(env: Env, poll_id: u32) -> Poll {
        let poll_key = symbol_short!("POLL");
        env.storage()
            .persistent()
            .get(&(poll_key, poll_id))
            .unwrap_or_else(|| panic!("Poll not found"))
    }

    /// Get poll results
    pub fn get_results(env: Env, poll_id: u32) -> Vec<u32> {
        let poll: Poll = Self::get_poll(env.clone(), poll_id);
        poll.votes
    }

    /// Close a poll (only creator can close)
    pub fn close_poll(env: Env, creator: Address, poll_id: u32) -> bool {
        creator.require_auth();
        
        let poll_key = symbol_short!("POLL");
        let poll: Poll = env
            .storage()
            .persistent()
            .get(&(poll_key.clone(), poll_id))
            .unwrap_or_else(|| panic!("Poll not found"));
        
        if poll.creator != creator {
            return false;
        }
        
        let updated_poll = Poll {
            is_active: false,
            ..poll
        };
        
        env.storage()
            .persistent()
            .set(&(poll_key, poll_id), &updated_poll);
        
        true
    }

    /// Get total poll count
    pub fn get_poll_count(env: Env) -> u32 {
        let next_id_key = symbol_short!("NEXT_ID");
        env.storage()
            .persistent()
            .get(&next_id_key)
            .unwrap_or(0u32)
    }

    /// Check if address has voted
    pub fn has_voted(env: Env, poll_id: u32, voter: Address) -> bool {
        let vote_key = symbol_short!("VOTE");
        env.storage()
            .persistent()
            .get(&(vote_key, poll_id, &voter))
            .unwrap_or(false)
    }

    /// Get all poll IDs (for listing)
    pub fn get_all_poll_ids(env: Env) -> Vec<u32> {
        let poll_count = Self::get_poll_count(env.clone());
        let mut poll_ids = vec![&env];
        
        for i in 1..=poll_count {
            poll_ids.push_back(i);
        }
        
        poll_ids
    }
}
