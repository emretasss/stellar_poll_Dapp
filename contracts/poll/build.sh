#!/bin/bash
# Stellar Poll Contract - Build Script for Linux/Mac

echo "========================================"
echo "Stellar Poll Contract - Build & Deploy"
echo "========================================"
echo ""

cd contracts/poll

echo "[1/4] Building contract..."
stellar contract build

if [ $? -ne 0 ]; then
    echo "ERROR: Build failed!"
    exit 1
fi

echo ""
echo "[2/4] Build successful!"
echo "WASM file: target/wasm32-unknown-unknown/release/poll_contract.wasm"
echo ""

echo "[3/4] Ready to deploy..."
echo "Run: stellar contract deploy --wasm target/wasm32-unknown-unknown/release/poll_contract.wasm --source YOUR_ACCOUNT --network testnet"
echo ""



