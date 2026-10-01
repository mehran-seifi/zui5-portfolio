import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";

export function getOrdersEntityPath(): string {
    return "/ZI_UI5_ORDER";
}

function getUseMockDataParam(): string | null {
    const fromSearch = new URLSearchParams(window.location.search).get("useMockData");

    if (fromSearch !== null) {
        return fromSearch;
    }

    const hashQueryIndex = window.location.hash.indexOf("?");

    if (hashQueryIndex === -1) {
        return null;
    }

    return new URLSearchParams(window.location.hash.slice(hashQueryIndex)).get("useMockData");
}

/**
 * Mock is off by default. Only the exact query value useMockData=true enables it.
 * Missing, empty, or false keeps the SAP OData V4 connection.
 */
export function isMockDataEnabled(): boolean {
    return getUseMockDataParam() === "true";
}

export function formatOrderBindingPath(orderUUID: string): string {
    const uuid = String(orderUUID).replace(/^guid'/i, "").replace(/'$/, "");

    return `${getOrdersEntityPath()}(${uuid})`;
}

export async function countOrders(model: ODataModel, status?: string): Promise<number> {
    const filters = status ? [new Filter("OrderStatus", FilterOperator.EQ, status)] : undefined;
    const binding = model.bindList(getOrdersEntityPath(), undefined, undefined, filters, {
        $count: true,
        $select: ["OrderUUID", "OrderID", "CustomerName", "OrderStatus", "Amount", "CurrencyCode"]
    });

    await binding.requestContexts(0, 1);

    return binding.getCount() ?? 0;
}
