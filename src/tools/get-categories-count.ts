import { z } from "zod";
import { GetCategoriesCountService } from "../services/get-categories-count.js";

const getCategoriesCountParams = z.object({});

type GetCategoriesCountParams = z.infer<typeof getCategoriesCountParams>;

export const getCategoriesCountTool = {
	name: "GET_CATEGORIES_COUNT",
	description:
		"Get the number of active markets for each category and the total market count.",
	parameters: getCategoriesCountParams,
	execute: async (_params: GetCategoriesCountParams) => {
		try {
			const service = new GetCategoriesCountService();
			const response = await service.execute();

			return service.format(response);
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error in GET_CATEGORIES_COUNT tool: ${error.message}`);
				return `Error getting category counts: ${error.message}`;
			}
			return "An unknown error occurred while fetching category counts";
		}
	},
} as const;
