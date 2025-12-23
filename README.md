# Holo Proof Vault 🛡️

A blockchain-based product authentication system using Fully Homomorphic Encryption (FHE) to store and verify product certificates with complete privacy. Built with FHEVM protocol by Zama, Next.js, and RainbowKit.

## 🎬 Demo

**🔗 Live Demo**: [https://holo-proof-vault.vercel.app/](https://holo-proof-vault.vercel.app/)

**📹 Video Demo**: [Watch Demo Video](./demo.mp4)

![Holo Proof Vault Demo](https://img.shields.io/badge/Demo-Live-success?style=for-the-badge&logo=vercel)
![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge)
![Tests](https://img.shields.io/badge/Tests-13%20Passed-success?style=for-the-badge)

## ✨ Features

- **🔐 Encrypted Product Data**: Store product prices and certificates encrypted on-chain using FHE
- **🔒 Privacy-Preserving Verification**: Only authorized users can decrypt product information
- **✍️ Wallet Authentication**: All operations require wallet signature via RainbowKit
- **🌐 Network Switching**: Seamlessly switch between local Hardhat and Sepolia testnet
- **🔄 Complete Encryption Loop**: Add → Store → Verify → Decrypt workflow
- **⚡ Real-time Status**: Live FHEVM initialization feedback
- **🎨 Modern UI**: Beautiful, responsive interface with Tailwind CSS and shadcn/ui

## Quick Start

### Prerequisites

- **Node.js**: v20.19.5
- **pnpm**: 10.8.2
- **MetaMask or Rainbow Wallet**

### Installation

1. **Install backend dependencies**

   ```bash
   pnpm install
   ```

2. **Install frontend dependencies**

   ```bash
   cd frontend
   pnpm install
   cd ..
   ```

3. **Environment setup**

   The `.env` file is already configured with test keys. For production, update:
   - `SEPOLIA_PRIVATE_KEY`: Your Sepolia private key
   - `INFURA_API_KEY`: Your Infura API key

4. **Compile contracts**

   ```bash
   npx hardhat compile
   ```

5. **Run tests**

   ```bash
   npx hardhat test
   ```

### Deployment

**Local Network:**
```bash
# Terminal 1: Start Hardhat node
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat deploy --network localhost

# Terminal 3: Start frontend
cd frontend && pnpm dev
```

**Sepolia Testnet:**
```bash
# Deploy to Sepolia
npx hardhat deploy --network sepolia

# Start frontend
cd frontend && pnpm dev
```

Visit http://localhost:3000

## 🎯 How It Works

### 1. **Upload Product** 
Users connect their wallet and upload product information. The system:
- Encrypts the product price using FHEVM
- Encrypts the authenticity certificate hash
- Requires wallet signature for authorization
- Stores encrypted data on-chain

### 2. **View Products**
- Browse all authenticated products
- See public information (name, image, seller)
- Encrypted data remains private on-chain

### 3. **Verify Product**
Authorized verifiers can:
- Request access to encrypted data
- Sign verification transaction
- Decrypt and view sensitive information
- Confirm product authenticity

### 4. **Decrypt Data**
Only authorized parties (seller and verifiers) can:
- Access encrypted price information
- View certificate details
- Verify product authenticity

## Deployment Instructions

### Prerequisites
- Node.js >= 20
- npm >= 7.0.0
- Hardhat

### Smart Contract Deployment

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Compile contracts:
```bash
npm run compile
```

4. Deploy to Sepolia testnet:
```bash
npx hardhat deploy --network sepolia
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Generate ABIs:
```bash
npm run genabi
```

4. Start development server:
```bash
npm run dev
```

## Features

- **FHE-based Product Authentication**: Store encrypted product certificates on-chain
- **Privacy-Preserving Verification**: Verify products without revealing sensitive data
- **Signature-based Authorization**: Secure operations using cryptographic signatures
- **React Frontend**: Modern UI with wallet integration
- **Comprehensive Testing**: Full test suite for contracts and frontend

## Architecture

- **Smart Contracts**: Solidity contracts using FHEVM for encrypted operations
- **Frontend**: Next.js with React, TypeScript, and Tailwind CSS
- **Wallet Integration**: MetaMask and WalletConnect support
- **Testing**: Hardhat for contracts, Vitest for frontend

##  Project Structure

```
holo-proof-vault/
├── contracts/
│   ├── FHECounter.sol          # Example contract
│   └── ProofVault.sol          # Main authentication contract
├── deploy/
│   └── 01_deploy_proof_vault.ts
├── test/
│   ├── ProofVault.ts           # Local network tests
│   └── ProofVaultSepolia.ts    # Sepolia testnet tests
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── providers.tsx       # RainbowKit + Wagmi setup
│   │   ├── wagmi.ts            # Network configuration
│   │   └── globals.css
│   ├── components/
│   │   ├── Header.tsx          # Navigation with wallet button
│   │   ├── Hero.tsx            # Landing section
│   │   ├── ProductGrid.tsx     # Product display
│   │   └── ui/                 # Shadcn/ui components
│   └── lib/
│       └── utils.ts
├── .env                        # Backend environment variables
├── hardhat.config.ts           # Network configuration
├── PROJECT_SUMMARY.md          # Detailed project documentation
├── FRONTEND_IMPLEMENTATION_GUIDE.md  # Frontend component guide
└── DEPLOYMENT_GUIDE.md         # Deployment instructions
```

## 📜 Available Scripts

### Backend
| Script             | Description                          |
| ------------------ | ------------------------------------ |
| `pnpm install`     | Install dependencies                 |
| `npx hardhat compile` | Compile smart contracts           |
| `npx hardhat test` | Run tests on local network           |
| `npx hardhat test --network sepolia` | Run tests on Sepolia    |
| `npx hardhat node` | Start local blockchain               |
| `npx hardhat deploy --network localhost` | Deploy to local     |
| `npx hardhat deploy --network sepolia` | Deploy to Sepolia     |

### Frontend
| Script             | Description                          |
| ------------------ | ------------------------------------ |
| `pnpm install`     | Install frontend dependencies        |
| `pnpm dev`         | Start development server             |
| `pnpm build`       | Build for production                 |
| `pnpm start`       | Start production server              |
| `pnpm genabi`      | Generate ABI from contracts          |

## 🏗️ Smart Contract Architecture

### ProofVault Contract

The main contract handling encrypted product authentication.

**Main Functions:**

| Function | Description | Access |
|----------|-------------|--------|
| `addProduct()` | Add encrypted product with signature | Public |
| `verifyProduct()` | Grant decryption access to caller | Public |
| `getProductInfo()` | Get public product information | View |
| `getProductEncryptedData()` | Get encrypted price and certificate | View |
| `getTotalProducts()` | Get total number of products | View |
| `getSellerProducts()` | Get products by seller address | View |

**Security Features:**
- ✅ Signature verification for all write operations
- ✅ Nonce-based replay attack prevention
- ✅ Access control for encrypted data
- ✅ Event emission for transparency

**Events:**
- `ProductAdded(productId, seller, name, timestamp)` - Emitted when product is added
- `ProductVerified(productId, verifier, timestamp)` - Emitted when product is verified

## 🧪 Testing

All tests pass successfully:

```bash
pnpm test
```

**Test Results:**
- ✅ 13 tests passing
- ✅ FHECounter: 3 tests
- ✅ ProofVault: 10 tests
- ⏭️ 1 test skipped (Sepolia network)
- ⚡ Execution time: ~784ms

**Test Coverage:**
- Product addition with encryption
- Signature verification
- Nonce replay protection
- Access control
- Product verification workflow
- Seller product tracking

## 📚 Documentation

- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)**: Complete project overview and architecture
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**: Step-by-step deployment instructions
- **[FRONTEND_IMPLEMENTATION_GUIDE.md](FRONTEND_IMPLEMENTATION_GUIDE.md)**: Frontend component implementation
- [FHEVM Documentation](https://docs.zama.ai/protocol)
- [RainbowKit Documentation](https://www.rainbowkit.com/)

## 🔑 Key Technologies

### Blockchain & Encryption
- **FHEVM** - Fully Homomorphic Encryption for Ethereum by Zama
- **Hardhat** - Ethereum development environment
- **Solidity** - Smart contract programming language

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Re-usable component library

### Web3 Integration
- **RainbowKit** - Wallet connection UI
- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript interface for Ethereum
- **ethers.js** - Ethereum library

### Development Tools
- **pnpm** - Fast, disk space efficient package manager
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🚀 Deployment

### Vercel Deployment

The application is deployed on Vercel with automatic deployments from the main branch.

**Live URL**: [https://holo-proof-vault.vercel.app/](https://holo-proof-vault.vercel.app/)

**Configuration:**
- CORS headers configured for FHEVM SharedArrayBuffer support
- WASM support enabled
- Automatic builds on push

### Local Development

```bash
# Install dependencies
pnpm install
cd frontend && pnpm install

# Start Hardhat node
pnpm hardhat node

# Deploy contracts (in another terminal)
pnpm hardhat deploy --network localhost

# Start frontend (in another terminal)
cd frontend && pnpm dev
```

## 🔒 Security Considerations

- **Private Keys**: Never commit private keys. Use environment variables.
- **Signature Verification**: All write operations require valid signatures.
- **Nonce Management**: Prevents replay attacks.
- **Access Control**: Only authorized users can decrypt sensitive data.
- **CORS Headers**: Properly configured for secure WASM execution.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support & Resources

- **FHEVM Documentation**: [docs.zama.ai](https://docs.zama.ai)
- **Zama Community**: [Discord](https://discord.gg/zama)
- **RainbowKit Docs**: [rainbowkit.com](https://www.rainbowkit.com/)
- **Next.js Docs**: [nextjs.org](https://nextjs.org)

## 🙏 Acknowledgments

- **Zama** - For the FHEVM protocol and encryption technology
- **RainbowKit** - For the beautiful wallet connection UI
- **Vercel** - For hosting and deployment platform

---

<div align="center">

**🛡️ Built with privacy-preserving encryption for secure product authentication**

[Live Demo](https://holo-proof-vault.vercel.app/) • [Watch Video](./demo.mp4) • [Documentation](./PROJECT_SUMMARY.md)

</div>
