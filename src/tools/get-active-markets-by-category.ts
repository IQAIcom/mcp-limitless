import { z } from "zod";
import { GetActiveMarketsByCategoryService } from "../services/get-active-markets-by-category.js";

const getActiveMarketsByCategoryParams = z.object({
	categoryId: z.number().describe("Category ID to filter markets by"),
	page: z.number().optional().describe("Page number for pagination"),
	limit: z.number().optional().describe("Number of items per page"),
	sortBy: z.string().optional().describe("Sort order (e.g., newest, volume)"),
});

type GetActiveMarketsByCategoryParams = z.infer<
	typeof getActiveMarketsByCategoryParams
>;

export const getActiveMarketsByCategoryTool = {
	name: "GET_ACTIVE_MARKETS_BY_CATEGORY",
	description:
		"Browse active (unresolved) markets filtered by category ID with optional pagination and sorting.",
	parameters: getActiveMarketsByCategoryParams,
	execute: async (params: GetActiveMarketsByCategoryParams) => {
		try {
			const service = new GetActiveMarketsByCategoryService();
			const response = await service.execute(params);

			return service.format(response, params.categoryId);
		} catch (error) {
			if (error instanceof Error) {
				console.log(
					`Error in GET_ACTIVE_MARKETS_BY_CATEGORY tool: ${error.message}`,
				);
				return `Error getting active markets by category: ${error.message}`;
			}
			return "An unknown error occurred while fetching active markets by category";
		}
	},
} as const;
