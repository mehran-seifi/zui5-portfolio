import MessageBox from 'sap/m/MessageBox'
import Controller from 'sap/ui/core/mvc/Controller'
import type { Route$PatternMatchedEvent } from 'sap/ui/core/routing/Route'
import UIComponent from 'sap/ui/core/UIComponent'
import JSONModel from 'sap/ui/model/json/JSONModel'
import type { Order } from '../model/mockData'
import { getMockOrders } from '../model/mockData'

/**
 * @namespace com.mehran.portfolio.zui5portfolio.controller
 */
export default class OrderDetails extends Controller {
  public onInit(): void {
    const router = UIComponent.getRouterFor(this)
    const route = router.getRoute('RouteOrderDetails')

    if (!route) {
      console.error('RouteOrderDetails was not found.')
      return
    }

    route.attachPatternMatched(this.onRouteMatched, this)
  }

  private onRouteMatched(event: Route$PatternMatchedEvent): void {
    const args = event.getParameter('arguments') as {
      orderId: string
    }

    const orderId = args.orderId
    const order: Order | undefined = getMockOrders().find(item => item.orderId === orderId)

    const view = this.getView()

    if (!view) {
      return
    }

    if (!order) {
      view.setModel(new JSONModel({}))
      MessageBox.error(`Order "${orderId}" was not found.`, {
        title: 'Order Not Found',
      })
      return
    }

    const model = new JSONModel(order)
    view.setModel(model)

    console.log('Selected order:', order)
    console.log('Order model data:', model.getData())
  }

  public onNavBack(): void {
    UIComponent.getRouterFor(this).navTo('RouteMain', {}, true)
  }
}
