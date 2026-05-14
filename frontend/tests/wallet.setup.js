// test/wallet.setup.ts
import { defineWalletSetup, MetaMask } from '@synthetixio/synpress'

export default defineWalletSetup(async ({ page, context }) => {
  const SEED_PHRASE = 'test test test test test test test test test test test junk'
  const PASSWORD = 'StrongPassword123!'

  const metamask = new MetaMask(context, page, PASSWORD)

  await metamask.importWallet(SEED_PHRASE)

  await metamask.addNetwork({
    networkName: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    chainId: 11155111,
    symbol: 'ETH',
    blockExplorer: 'https://sepolia.etherscan.io'
  })
})