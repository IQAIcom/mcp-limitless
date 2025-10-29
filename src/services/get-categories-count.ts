import dedent from "dedent";
import { client } from "../lib/client.js";

interface CategoryCount {
	categoryId: string;
	count: number;
}

export class GetCategoriesCountService {
	async execute(): Promise<CategoryCount[]> {
		try {
			// API returns {category: {id: count}, totalCount: number}
			const response = await client.request<{
				category: Record<string, number>;
				totalCount: number;
			}>("/markets/categories/count");

			if (!response || !response.category) {
				return [];
			}

			// Transform object to array
			return Object.entries(response.category).map(([id, count]) => ({
				categoryId: id,
				count: count,
			}));
		} catch (error: any) {
			throw new Error(`Failed to get category counts: ${error.message}`);
		}
	}

	format(categories: CategoryCount[]): string {
		if (!categories || categories.length === 0) {
			return "No categories found.";
		}

		const formattedCategories = categories
			.map((category: CategoryCount) => {
				return `- Category ${category.categoryId}: ${category.count} markets`;
			})
			.join("\n");

		const totalCount = categories.reduce((sum, cat) => sum + cat.count, 0);

		return dedent`
			📊 Market Categories

			${formattedCategories}

			📈 Total categories: ${categories.length}
			📈 Total markets: ${totalCount}
		`;
	}
}
