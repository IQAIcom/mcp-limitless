/**
 * Test wallet helper for integration tests
 * Provides utilities for generating wallets and signing messages
 */

import { Wallet } from "ethers";

/**
 * Test wallet for integration tests
 * This is a deterministic wallet generated from a known private key
 * DO NOT USE IN PRODUCTION - FOR TESTING ONLY
 */
export class TestWallet {
	private wallet: Wallet;

	constructor() {
		// Generate a random wallet for each test run
		// This ensures tests are isolated and don't interfere with each other
		this.wallet = Wallet.createRandom();
	}

	/**
	 * Get the wallet address
	 */
	get address(): string {
		return this.wallet.address;
	}

	/**
	 * Sign a message with the wallet
	 */
	async signMessage(message: string): Promise<string> {
		return await this.wallet.signMessage(message);
	}

	/**
	 * Get the wallet instance (for advanced use cases)
	 */
	get instance(): Wallet {
		return this.wallet;
	}
}

/**
 * Create a test wallet for integration tests
 */
export function createTestWallet(): TestWallet {
	return new TestWallet();
}
