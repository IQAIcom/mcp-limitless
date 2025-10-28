import { z } from "zod";
import { CreateOrderService } from "../services/create-order.js";

const orderSchema = z.object({
	salt: z.number().describe("Unique random value for signature uniqueness"),
	maker: z
		.string()
		.regex(/^0x[a-fA-F0-9]{40}$/)
		.describe("Ethereum address of the maker (order creator)"),
	signer: z
		.string()
		.regex(/^0x[a-fA-F0-9]{40}$/)
		.describe("Address that signed the order"),
	taker: z.string().describe("Specific taker address (0x0 for open orders)"),
	tokenId: z.string().describe("Token ID being traded (YES or NO position)"),
	makerAmount: z.number().min(0).describe("Amount maker is offering (in wei)"),
	takerAmount: z
		.number()
		.min(0)
		.describe("Amount maker wants in return (in wei)"),
	expiration: z.string().describe("Order expiration timestamp"),
	nonce: z.number().describe("Order nonce for cancellation tracking"),
	price: z
		.number()
		.min(0.01)
		.max(0.99)
		.describe("Order price as decimal (0.01-0.99)"),
	feeRateBps: z.number().describe("Fee rate in basis points"),
	side: z.enum(["BUY", "SELL"]).describe("Order side"),
	signatureType: z.number().describe("Signature type"),
	signature: z.string().describe("Order signature"),
});

const createOrderParams = z.object({
	order: orderSchema.describe("Order details including signature and amounts"),
	ownerId: z.number().describe("Profile ID of the order owner"),
	orderType: z
		.enum(["FOK", "GTC"])
		.describe("Order type (GTC=Good Till Cancelled, FOK=Fill Or Kill)"),
	marketSlug: z.string().describe("Market identifier slug"),
	apiKey: z
		.string()
		.optional()
		.describe(
			"API key or bearer token for authentication (required for trading)",
		),
});

type CreateOrderParams = z.infer<typeof createOrderParams>;

export const createOrderTool = {
	name: "CREATE_ORDER",
	description:
		"Create a buy or sell order for prediction market positions on Limitless. Requires signed order data and authentication. Returns order details and match information if filled immediately.",
	parameters: createOrderParams,
	execute: async (params: CreateOrderParams) => {
		try {
			const service = new CreateOrderService();
			const { apiKey, ...orderParams } = params;
			const response = await service.execute(orderParams, apiKey);

			return service.format(response);
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error in CREATE_ORDER tool: ${error.message}`);
				return `Error creating order: ${error.message}`;
			}
			return "An unknown error occurred while creating the order";
		}
	},
} as const;
