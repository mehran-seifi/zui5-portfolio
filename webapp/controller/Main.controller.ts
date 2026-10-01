import ColumnListItem from "sap/m/ColumnListItem";
import MessageBox from "sap/m/MessageBox";
import type SearchField from "sap/m/SearchField";
import type { SearchField$LiveChangeEvent } from "sap/m/SearchField";
import type Select from "sap/m/Select";
import type { Select$ChangeEvent } from "sap/m/Select";
import type Table from "sap/m/Table";
import type Control from "sap/ui/core/Control";
import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import JSONModel from "sap/ui/model/json/JSONModel";
import type ListBinding from "sap/ui/model/ListBinding";
import type ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";
import Sorter from "sap/ui/model/Sorter";
import { orderStatusState } from "../model/formatter";
import { getMockOrders } from "../model/mockData";
import { countOrders, isMockDataEnabled } from "../model/order";

type DashboardData = {
    busy: boolean;
    hasError: boolean;
    errorMessage: string;
    usingMock: boolean;
    totalOrders: string;
    openOrders: string;
    completedOrders: string;
};

type OrdersReceivedParameters = {
    error?: Error;
};

type ItemsBindingInfo = {
    template?: Control;
};

/**
 * @namespace com.mehran.portfolio.zui5portfolio.controller
 */
export default class Main extends Controller {
    public formatter = {
        orderStatusState
    };

    public onInit(): void {
        const view = this.getView();

        if (!view) {
            return;
        }

        view.setModel(
            new JSONModel({
                busy: true,
                hasError: false,
                errorMessage: "",
                usingMock: isMockDataEnabled(),
                totalOrders: "–",
                openOrders: "–",
                completedOrders: "–"
            } satisfies DashboardData),
            "dashboard"
        );

        if (isMockDataEnabled()) {
            this.enableExplicitMockMode();
        }
    }

    public onOrderPress(event: { getSource: () => ColumnListItem }): void {
        const item = event.getSource();
        const context = item.getBindingContext("orders");

        if (!context) {
            return;
        }

        const orderUUID = String(context.getProperty("OrderUUID") ?? "");

        if (!orderUUID) {
            return;
        }

        UIComponent.getRouterFor(this).navTo("RouteOrderDetails", {
            orderUUID
        });
    }

    public onSortChange(): void {
        const sortField = (this.byId("ordersSortField") as Select | undefined)?.getSelectedKey();
        const sortDirection = (this.byId("ordersSortDirection") as Select | undefined)?.getSelectedKey();
        const binding = this.getOrdersBinding();

        if (!binding || !sortField) {
            return;
        }

        binding.sort(new Sorter(sortField, sortDirection === "desc"));
    }

    public onStatusFilterChange(event: Select$ChangeEvent): void {
        this.applyFilters(event.getSource().getSelectedKey());
    }

    public onSearch(event: SearchField$LiveChangeEvent): void {
        const query = event.getParameter("newValue")?.trim() ?? "";
        const selectedStatus = (this.byId("ordersStatusFilter") as Select | undefined)?.getSelectedKey();

        this.applyFilters(selectedStatus, query);
    }

    public onRefresh(): void {
        const searchField = this.byId("ordersSearchField") as SearchField | undefined;
        const statusFilter = this.byId("ordersStatusFilter") as Select | undefined;
        const sortField = this.byId("ordersSortField") as Select | undefined;
        const sortDirection = this.byId("ordersSortDirection") as Select | undefined;

        searchField?.setValue("");
        statusFilter?.setSelectedKey("All");
        sortField?.setSelectedKey("OrderID");
        sortDirection?.setSelectedKey("asc");

        const binding = this.getOrdersBinding();

        binding?.filter([]);
        this.onSortChange();

        if (isMockDataEnabled()) {
            this.enableExplicitMockMode();
            return;
        }

        this.setDashboard({ busy: true, hasError: false, errorMessage: "" });
        (binding as ODataListBinding | undefined)?.refresh();
        void this.refreshKpis();
    }

    public onOrdersRequested(): void {
        this.setDashboard({ busy: true, hasError: false, errorMessage: "" });
    }

    public onOrdersReceived(event: { getParameters: () => OrdersReceivedParameters }): void {
        const error = event.getParameters().error;

        if (error) {
            this.showBackendError(error);
            return;
        }

        void this.refreshKpis();
    }

    public onRetry(): void {
        this.onRefresh();
    }

    private enableExplicitMockMode(): void {
        const view = this.getView();
        const table = this.byId("ordersTable") as Table | undefined;

        if (!view || !table) {
            return;
        }

        const orders = getMockOrders();

        view.setModel(new JSONModel({ items: orders }), "orders");
        this.setDashboard({
            busy: false,
            hasError: false,
            errorMessage: "",
            usingMock: true,
            totalOrders: String(orders.length),
            openOrders: String(orders.filter((order) => order.OrderStatus === "Open").length),
            completedOrders: String(orders.filter((order) => order.OrderStatus === "Completed").length)
        });

        const bindingInfo = table.getBindingInfo("items") as ItemsBindingInfo | undefined;
        const template = bindingInfo?.template;

        if (!template) {
            return;
        }

        table.bindItems({
            path: "orders>/items",
            template,
            templateShareable: true
        });
    }

    private async refreshKpis(): Promise<void> {
        const view = this.getView();

        if (!view) {
            return;
        }

        if (isMockDataEnabled()) {
            this.setDashboard({ busy: false, usingMock: true });
            return;
        }

        const model = view.getModel("orders") as ODataModel | undefined;

        if (!model || typeof model.bindList !== "function") {
            this.showBackendError(new Error("SAP OData model is not available."));
            return;
        }

        try {
            const totalOrders = await countOrders(model);
            const openOrders = await countOrders(model, "Open");
            const completedOrders = await countOrders(model, "Completed");

            this.setDashboard({
                busy: false,
                hasError: false,
                errorMessage: "",
                usingMock: false,
                totalOrders: String(totalOrders),
                openOrders: String(openOrders),
                completedOrders: String(completedOrders)
            });
        } catch (error) {
            this.showBackendError(error);
        }
    }

    private applyFilters(selectedStatus?: string, searchQuery = ""): void {
        const binding = this.getOrdersBinding();

        if (!binding) {
            return;
        }

        const filters: Filter[] = [];

        if (selectedStatus && selectedStatus !== "All") {
            filters.push(new Filter("OrderStatus", FilterOperator.EQ, selectedStatus));
        }

        if (searchQuery) {
            filters.push(
                new Filter({
                    filters: [
                        new Filter("OrderID", FilterOperator.Contains, searchQuery),
                        new Filter("CustomerName", FilterOperator.Contains, searchQuery),
                        new Filter("OrderStatus", FilterOperator.Contains, searchQuery)
                    ],
                    and: false
                })
            );
        }

        binding.filter(filters.length > 1 ? new Filter({ filters, and: true }) : filters);
    }

    private getOrdersBinding(): ListBinding | undefined {
        return this.byId("ordersTable")?.getBinding("items") as ListBinding | undefined;
    }

    private setDashboard(update: Partial<DashboardData>): void {
        const dashboard = this.getView()?.getModel("dashboard") as JSONModel | undefined;

        dashboard?.setData({
            ...(dashboard.getData() as DashboardData),
            ...update
        });
    }

    private showBackendError(error: unknown): void {
        const message = error instanceof Error ? error.message : String(error);

        this.setDashboard({
            busy: false,
            hasError: true,
            errorMessage: message,
            usingMock: false,
            totalOrders: "–",
            openOrders: "–",
            completedOrders: "–"
        });

        MessageBox.error(message, {
            title: "Backend request failed",
            actions: [MessageBox.Action.RETRY, MessageBox.Action.CLOSE],
            emphasizedAction: MessageBox.Action.RETRY,
            onClose: (action) => {
                if (action === "RETRY") {
                    this.onRefresh();
                }
            }
        });
    }
}
