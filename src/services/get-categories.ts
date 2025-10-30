import dedent from "dedent";
import { client } from "../lib/client.js";

interface CategoryMetadata {
	logoUrl: string | null;
	chatName: string | null;
	coverUrl: string | null;
}

interface Category {
	id: number;
	name: string;
	priority: number;
	metadata: CategoryMetadata | null;
}

export class GetCategoriesService {
	async execute(): Promise<Category[]> {
		try {
			const response = await client.request<Category[]>("/categories");

			if (!response || !Array.isArray(response)) {
				return [];
			}

			return response;
		} catch (error: any) {
			throw new Error(`Failed to get categories: ${error.message}`);
		}
	}

	format(categories: Category[]): string {
		if (!categories || categories.length === 0) {
			return "No categories found.";
		}

		// Sort by priority descending
		const sortedCategories = [...categories].sort(
			(a, b) => b.priority - a.priority,
		);

		const formattedCategories = sortedCategories
			.map((category: Category) => {
				const chatInfo = category.metadata?.chatName
					? ` (Chat: ${category.metadata.chatName})`
					: "";
				return `- ${category.name} (ID: ${category.id}, Priority: ${category.priority})${chatInfo}`;
			})
			.join("\n");

		return dedent`
			📂 Limitless Categories

			${formattedCategories}

			📊 Total categories: ${categories.length}
		`;
	}
}
