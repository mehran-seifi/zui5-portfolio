import type ColumnListItem from 'sap/m/ColumnListItem'
import type SearchField from 'sap/m/SearchField'
import type { SearchField$LiveChangeEvent } from 'sap/m/SearchField'
import type Select from 'sap/m/Select'
import type { Select$ChangeEvent } from 'sap/m/Select'
import type Event from 'sap/ui/base/Event'
import Controller from 'sap/ui/core/mvc/Controller'
import UIComponent from 'sap/ui/core/UIComponent'
import Filter from 'sap/ui/model/Filter'
import FilterOperator from 'sap/ui/model/FilterOperator'
import JSONModel from 'sap/ui/model/json/JSONModel'
import type ListBinding from 'sap/ui/model/ListBinding'
import Sorter from 'sap/ui/model/Sorter'
import { getMockOrders } from '../model/mockData'

/**
 * @namespace com.mehran.portfolio.zui5portfolio.controller
 */
export default class Main extends Controller {
  public onOrderPress(event: Event): void {
    const item = event.getSource() as ColumnListItem
    const context = item.getBindingContext('orders')

    if (!context) {
      return
    }

    const orderId = context.getProperty('orderId') as string

    UIComponent.getRouterFor(this).navTo('RouteOrderDetails', {
      orderId,
    })
  }

  public onInit(): void {
    this.loadDashboardData()
  }

  public onSortChange(): void {
    const sortField = (this.byId('ordersSortField') as Select | undefined)?.getSelectedKey()

    const sortDirection = (this.byId('ordersSortDirection') as Select | undefined)?.getSelectedKey()

    const binding = this.byId('ordersTable')?.getBinding('items') as ListBinding | undefined

    if (!binding || !sortField) {
      return
    }

    const descending = sortDirection === 'desc'
    const sorter = new Sorter(sortField, descending)

    binding.sort(sorter)
  }

  public onStatusFilterChange(event: Select$ChangeEvent): void {
    this.applyFilters(event.getSource().getSelectedKey())
  }

  public onSearch(event: SearchField$LiveChangeEvent): void {
    const query = event.getParameter('newValue')?.trim() ?? ''

    const selectedStatus = (this.byId('ordersStatusFilter') as Select | undefined)?.getSelectedKey()

    this.applyFilters(selectedStatus, query)
  }

  public onRefresh(): void {
    this.loadDashboardData()

    const searchField = this.byId('ordersSearchField') as SearchField | undefined

    const statusFilter = this.byId('ordersStatusFilter') as Select | undefined

    const sortField = this.byId('ordersSortField') as Select | undefined

    const sortDirection = this.byId('ordersSortDirection') as Select | undefined

    const binding = this.byId('ordersTable')?.getBinding('items') as ListBinding | undefined

    searchField?.setValue('')
    statusFilter?.setSelectedKey('All')
    sortField?.setSelectedKey('orderId')
    sortDirection?.setSelectedKey('asc')

    binding?.filter([])
    this.onSortChange()
  }

  private loadDashboardData(): void {
    const orders = getMockOrders()
    const view = this.getView()

    if (!view) {
      return
    }

    const ordersModel = view.getModel('orders') as JSONModel | undefined

    if (ordersModel) {
      ordersModel.setData({ items: orders })
    } else {
      view.setModel(new JSONModel({ items: orders }), 'orders')
    }

    const dashboardData = {
      totalOrders: orders.length,
      openOrders: orders.filter(order => order.status === 'Open').length,
      completedOrders: orders.filter(order => order.status === 'Completed').length,
    }

    const dashboardModel = view.getModel('dashboard') as JSONModel | undefined

    if (dashboardModel) {
      dashboardModel.setData(dashboardData)
    } else {
      view.setModel(new JSONModel(dashboardData), 'dashboard')
    }
  }

  private applyFilters(selectedStatus?: string, searchQuery = ''): void {
    const binding = this.byId('ordersTable')?.getBinding('items') as ListBinding | undefined

    if (!binding) {
      return
    }

    const filters: Filter[] = []

    if (selectedStatus && selectedStatus !== 'All') {
      filters.push(new Filter('status', FilterOperator.EQ, selectedStatus))
    }

    if (searchQuery) {
      filters.push(
        new Filter({
          filters: [
            new Filter('orderId', FilterOperator.Contains, searchQuery),
            new Filter('customer', FilterOperator.Contains, searchQuery),
            new Filter('status', FilterOperator.Contains, searchQuery),
          ],
          and: false,
        }),
      )
    }

    binding.filter(filters.length > 1 ? new Filter({ filters, and: true }) : filters)
  }
}
