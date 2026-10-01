export interface Order {
  orderId: string
  customer: string
  status: string
  statusState: "Warning" | "Success" | "Information"
  amount: number
  currency: string
}

export function getMockOrders(): Order[] {
  return [
    {
      orderId: "SO-1001",
      customer: "Acme Corporation",
      status: "Open",
      statusState: "Warning",
      amount: 1250,
      currency: "EUR"
    },
    {
      orderId: "SO-1002",
      customer: "Global Retail GmbH",
      status: "Completed",
      statusState: "Success",
      amount: 3480,
      currency: "EUR"
    },
    {
      orderId: "SO-1003",
      customer: "Tech Solutions AG",
      status: "In Progress",
      statusState: "Information",
      amount: 920,
      currency: "EUR"
    },
    {
      orderId: "SO-1004",
      customer: "Nordic Systems GmbH",
      status: "Completed",
      statusState: "Success",
      amount: 2150,
      currency: "EUR"
    },
    {
      orderId: "SO-1005",
      customer: "Future Commerce GmbH",
      status: "Open",
      statusState: "Warning",
      amount: 780,
      currency: "EUR"
    }
  ];
}
