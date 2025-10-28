import dedent from "dedent";
import { client } from "../lib/client.js";

interface CategoryCount {
	categoryId: number;
	categoryName: string;
	count: number;
}

interface CategoryCountResponse {
	categories: CategoryCount[];
	totalCount: number;
}

export class GetCategoriesCountService {
	async execute(): Promise<CategoryCountResponse> {
		try {
			const response = await client.request<CategoryCountResponse>(
				"/markets/categories/count",
			);

			if (!response) {
				throw new Error("Unable to retrieve category counts");
			}

			return response;
		} catch (error: any) {
			throw new Error(`Failed to get category counts: ${error.message}`);
		}
	}

	format(response: CategoryCountResponse): string {
		if (!response.categories || response.categories.length === 0) {
			return "No categories found.";
		}

		const formattedCategories = response.categories
			.map((category: CategoryCount) => {
				return `- ${category.categoryName} (ID: ${category.categoryId}): ${category.count} markets`;
			})
			.join("\n");

		return dedent`
			📊 Active Market Counts by Category

			${formattedCategories}

			📈 Total Active Markets: ${response.totalCount}
		`;
	}
}
