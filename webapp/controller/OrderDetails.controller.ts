import MessageBox from "sap/m/MessageBox";
import Controller from "sap/ui/core/mvc/Controller";
import type { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import UIComponent from "sap/ui/core/UIComponent";
import JSONModel from "sap/ui/model/json/JSONModel";
import { orderStatusState } from "../model/formatter";
import { getMockOrders } from "../model/mockData";
import { formatOrderBindingPath, isMockDataEnabled } from "../model/order";

type DataReceivedParameters = {
    error?: Error;
};

/**
 * @namespace com.mehran.portfolio.zui5portfolio.controller
 */
export default class OrderDetails extends Controller {
    public formatter = {
        orderStatusState
    };

    public onInit(): void {
        const view = this.getView();
        const router = UIComponent.getRouterFor(this);
        const route = router.getRoute("RouteOrderDetails");

        view?.setModel(
            new JSONModel({
                busy: false,
                hasError: false,
                usingMock: isMockDataEnabled()
            }),
            "view"
        );

        if (!route) {
            MessageBox.error("RouteOrderDetails was not found.");
            return;
        }

        route.attachPatternMatched((event: Route$PatternMatchedEvent) => {
            this.onRouteMatched(event);
        });
    }

    public onNavBack(): void {
        UIComponent.getRouterFor(this).navTo("RouteMain", {}, true);
    }

    private onRouteMatched(event: Route$PatternMatchedEvent): void {
        const args = event.getParameter("arguments") as { orderUUID: string };
        const orderUUID = args.orderUUID;
        const view = this.getView();
        const viewModel = view?.getModel("view") as JSONModel | undefined;

        if (!view || !orderUUID) {
            MessageBox.error("Order key is missing.");
            return;
        }

        if (isMockDataEnabled()) {
            this.bindMockOrder(orderUUID);
            return;
        }

        viewModel?.setProperty("/busy", true);
        viewModel?.setProperty("/hasError", false);
        viewModel?.setProperty("/usingMock", false);

        view.unbindElement("orders");
        view.bindElement({
            path: formatOrderBindingPath(orderUUID),
            model: "orders",
            parameters: {
                $select: "OrderUUID,OrderID,CustomerName,OrderStatus,Amount,CurrencyCode"
            },
            events: {
                dataRequested: () => {
                    viewModel?.setProperty("/busy", true);
                },
                dataReceived: (dataEvent: { getParameters: () => DataReceivedParameters }) => {
                    viewModel?.setProperty("/busy", false);

                    const error = dataEvent.getParameters().error;

                    if (error) {
                        viewModel?.setProperty("/hasError", true);
                        MessageBox.error(error.message, {
                            title: "Backend request failed"
                        });
                        return;
                    }

                    if (!view.getBindingContext("orders")) {
                        viewModel?.setProperty("/hasError", true);
                        MessageBox.error(`Order "${orderUUID}" was not found.`, {
                            title: "Order Not Found"
                        });
                    }
                }
            }
        });
    }

    private bindMockOrder(orderUUID: string): void {
        const view = this.getView();
        const order = getMockOrders().find((item) => item.OrderUUID === orderUUID);
        const viewModel = view?.getModel("view") as JSONModel | undefined;

        viewModel?.setProperty("/usingMock", true);
        viewModel?.setProperty("/busy", false);

        if (!view) {
            return;
        }

        if (!order) {
            viewModel?.setProperty("/hasError", true);
            MessageBox.error(`Order "${orderUUID}" was not found.`, {
                title: "Order Not Found"
            });
            return;
        }

        view.setModel(new JSONModel(order), "orders");
        view.bindElement({
            path: "/",
            model: "orders"
        });
    }
}
