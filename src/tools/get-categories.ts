import { z } from "zod";
import { GetCategoriesService } from "../services/get-categories.js";

const getCategoriesParams = z.object({});

type GetCategoriesParams = z.infer<typeof getCategoriesParams>;

export const getCategoriesTool = {
	name: "GET_CATEGORIES",
	description:
		"Get all available categories on Limitless with their IDs, names, priorities, and metadata. Use this to discover available categories for filtering markets.",
	parameters: getCategoriesParams,
	execute: async (_params: GetCategoriesParams) => {
		try {
			const service = new GetCategoriesService();
			const response = await service.execute();

			return service.format(response);
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error in GET_CATEGORIES tool: ${error.message}`);
				return `Error getting categories: ${error.message}`;
			}
			return "An unknown error occurred while fetching categories";
		}
	},
} as const;
