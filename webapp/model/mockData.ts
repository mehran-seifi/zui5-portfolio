/**
 * Explicit development fallback only. Disabled unless ?useMockData=true is set.
 * These five records are not backend data; the live service has three orders.
 */
export interface Order {
    OrderUUID: string;
    OrderID: string;
    CustomerName: string;
    OrderStatus: string;
    Amount: number;
    CurrencyCode: string;
}

export function getMockOrders(): Order[] {
    return [
        {
            OrderUUID: "11111111-1111-1111-1111-111111111111",
            OrderID: "SO-1001",
            CustomerName: "Acme Corporation",
            OrderStatus: "Open",
            Amount: 1250,
            CurrencyCode: "EUR"
        },
        {
            OrderUUID: "22222222-2222-2222-2222-222222222222",
            OrderID: "SO-1002",
            CustomerName: "Global Retail GmbH",
            OrderStatus: "Completed",
            Amount: 3480,
            CurrencyCode: "EUR"
        },
        {
            OrderUUID: "33333333-3333-3333-3333-333333333333",
            OrderID: "SO-1003",
            CustomerName: "Tech Solutions AG",
            OrderStatus: "In Progress",
            Amount: 920,
            CurrencyCode: "EUR"
        },
        {
            OrderUUID: "44444444-4444-4444-4444-444444444444",
            OrderID: "SO-1004",
            CustomerName: "Nordic Systems GmbH",
            OrderStatus: "Completed",
            Amount: 2150,
            CurrencyCode: "EUR"
        },
        {
            OrderUUID: "55555555-5555-5555-5555-555555555555",
            OrderID: "SO-1005",
            CustomerName: "Future Commerce GmbH",
            OrderStatus: "Open",
            Amount: 780,
            CurrencyCode: "EUR"
        }
    ];
}
