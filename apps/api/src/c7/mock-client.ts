import type { Commerce7Client, ListOrdersParams, ListOrdersResult } from "./types.js";

type PageKey = string;

type PageSpec = {
  orders: ListOrdersResult["orders"];
  nextCursor: string | null;
};

/**
 * Deterministic cursor pages for Phase A (no network).
 * Keys are cursor **request** values (`start` for the first page).
 */
export class MockCommerce7Client implements Commerce7Client {
  private readonly pages: Map<PageKey, PageSpec>;

  constructor(pages: Map<PageKey, PageSpec>) {
    this.pages = pages;
  }

  /** Two-page order list: `start` → `page-2` → done. */
  static twoPageDemo(): MockCommerce7Client {
    return new MockCommerce7Client(
      new Map([
        [
          "start",
          {
            orders: [
              { id: "ord_mock_1", updatedAt: "2024-01-01T10:00:00.000Z" },
              { id: "ord_mock_2", updatedAt: "2024-01-01T11:00:00.000Z" },
            ],
            nextCursor: "page-2",
          },
        ],
        [
          "page-2",
          {
            orders: [{ id: "ord_mock_3", updatedAt: "2024-01-02T09:00:00.000Z" }],
            nextCursor: null,
          },
        ],
      ]),
    );
  }

  async listOrders(params: ListOrdersParams): Promise<ListOrdersResult> {
    const key = params.cursor;
    const page = this.pages.get(key);
    if (!page) {
      return { orders: [], nextCursor: null };
    }
    const limit = params.limit ?? 50;
    return {
      orders: page.orders.slice(0, limit),
      nextCursor: page.nextCursor,
    };
  }
}
