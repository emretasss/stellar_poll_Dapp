# Stellar Poll Contract - Build & Deploy Guide

## 📋 Prerequisites

1. **Stellar CLI** installed
2. **Rust** installed
3. **Testnet account** funded

## 🔧 Setup Scripts

### 1. Build Contract

```bash
# Windows PowerShell
cd contracts/poll
stellar contract build

# Output: target/wasm32-unknown-unknown/release/poll_contract.wasm
```

### 2. Deploy Contract

```bash
# Deploy to testnet
stellar contract deploy `
  --wasm target/wasm32-unknown-unknown/release/poll_contract.wasm `
  --source YOUR_SOURCE_ACCOUNT `
  --network testnet

# Copy the Contract ID from output
```

### 3. Generate TypeScript Bindings

```bash
# Generate bindings
stellar contract bindings ts `
  --contract-id YOUR_CONTRACT_ID `
  --network testnet `
  --output-dir ../../src/contracts/poll
```

### 4. Initialize Contract

```bash
# Initialize the contract
stellar contract invoke `
  --id YOUR_CONTRACT_ID `
  --source YOUR_SOURCE_ACCOUNT `
  --network testnet `
  -- initialize
```

## 📝 Complete Workflow

1. Build → 2. Deploy → 3. Generate Bindings → 4. Initialize → 5. Update .env.local



