'use client'

import { useState, useMemo } from 'react'
import { Truck, Package, CheckCircle2, Users, MapPin, Phone, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useOrders } from '@/lib/order-context'
import type { Order } from '@/lib/types'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

interface CustomerGroup {
  phone: string
  customerName: string
  address: string
  orders: Order[]
  totalItems: number
  totalAmount: number
}

export default function ShipmentsPage() {
  const { orders, shipmentGroups, createShipmentGroup, updateShipmentStatus, updateOrderStatus } = useOrders()
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [expandedCustomers, setExpandedCustomers] = useState<string[]>([])

  // Get orders ready to ship
  const readyToShipOrders = orders.filter(o => o.status === 'READY_TO_SHIP')

  // Group orders by customer (phone number)
  const customerGroups = useMemo(() => {
    const groups: Record<string, CustomerGroup> = {}
    
    readyToShipOrders.forEach(order => {
      if (!groups[order.phone]) {
        groups[order.phone] = {
          phone: order.phone,
          customerName: order.customerName,
          address: order.address,
          orders: [],
          totalItems: 0,
          totalAmount: 0
        }
      }
      groups[order.phone].orders.push(order)
      groups[order.phone].totalItems += order.items.reduce((sum, item) => sum + item.quantity, 0)
      groups[order.phone].totalAmount += order.totalAmount
    })
    
    return Object.values(groups)
  }, [readyToShipOrders])

  const toggleExpand = (phone: string) => {
    setExpandedCustomers(prev => 
      prev.includes(phone) 
        ? prev.filter(p => p !== phone)
        : [...prev, phone]
    )
  }

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const selectAllFromCustomer = (group: CustomerGroup) => {
    const orderIds = group.orders.map(o => o.id)
    const allSelected = orderIds.every(id => selectedOrders.includes(id))
    
    if (allSelected) {
      setSelectedOrders(prev => prev.filter(id => !orderIds.includes(id)))
    } else {
      setSelectedOrders(prev => [...new Set([...prev, ...orderIds])])
    }
  }

  const handleCreateShipment = () => {
    if (selectedOrders.length === 0) return
    
    // Group selected orders by customer
    const selectedOrdersData = orders.filter(o => selectedOrders.includes(o.id))
    const customerPhones = [...new Set(selectedOrdersData.map(o => o.phone))]
    
    if (customerPhones.length > 1) {
      alert('Vui lòng chỉ chọn đơn hàng của một khách hàng để gom ship')
      return
    }
    
    createShipmentGroup(selectedOrders)
    setSelectedOrders([])
    alert('Đã tạo gói giao hàng thành công!')
  }

  const handleMarkShipped = (orderId: string) => {
    updateOrderStatus(orderId, 'SHIPPED')
  }

  const totalReadyToShip = readyToShipOrders.length
  const totalCustomers = customerGroups.length

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Gom ship & Vận chuyển</h1>
        <p className="text-muted-foreground">Gom nhiều đơn của cùng khách hàng để tiết kiệm phí ship</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-100">
                <Package className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalReadyToShip}</p>
                <p className="text-sm text-muted-foreground">Đơn sẵn sàng</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalCustomers}</p>
                <p className="text-sm text-muted-foreground">Khách hàng</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <Truck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{shipmentGroups.length}</p>
                <p className="text-sm text-muted-foreground">Gói đã gom</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{selectedOrders.length}</p>
                <p className="text-sm text-muted-foreground">Đã chọn</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      {selectedOrders.length > 0 && (
        <Card className="mb-6 border-primary">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">
                Đã chọn {selectedOrders.length} đơn hàng
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedOrders([])} className="rounded-xl">
                  Bỏ chọn
                </Button>
                <Button onClick={handleCreateShipment} className="rounded-xl">
                  <Truck className="h-4 w-4 mr-2" />
                  Gom ship
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Groups */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Đơn hàng theo khách hàng</h2>
        
        {customerGroups.length > 0 ? (
          customerGroups.map((group) => {
            const isExpanded = expandedCustomers.includes(group.phone)
            const allSelected = group.orders.every(o => selectedOrders.includes(o.id))
            const someSelected = group.orders.some(o => selectedOrders.includes(o.id))
            
            return (
              <Card key={group.phone}>
                <Collapsible open={isExpanded} onOpenChange={() => toggleExpand(group.phone)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={() => selectAllFromCustomer(group)}
                          className="mt-1"
                        />
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {group.customerName}
                            <Badge variant="outline" className="text-xs">
                              {group.orders.length} đơn
                            </Badge>
                          </CardTitle>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5" />
                              {group.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[200px]">{group.address}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold text-primary">{formatPrice(group.totalAmount)}</p>
                          <p className="text-xs text-muted-foreground">{group.totalItems} sản phẩm</p>
                        </div>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-3 border-t pt-4">
                        {group.orders.map((order) => (
                          <div 
                            key={order.id} 
                            className={`flex items-center justify-between p-3 rounded-xl border ${
                              selectedOrders.includes(order.id) 
                                ? 'bg-primary/5 border-primary/30' 
                                : 'bg-muted/50 border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={selectedOrders.includes(order.id)}
                                onCheckedChange={() => toggleSelectOrder(order.id)}
                              />
                              <div>
                                <p className="font-medium text-primary">{order.orderCode}</p>
                                <p className="text-sm text-muted-foreground">
                                  {order.campaignName}
                                </p>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {order.items.map((item, idx) => (
                                    <span key={idx}>
                                      {item.optionName} x{item.quantity}
                                      {idx < order.items.length - 1 ? ', ' : ''}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatPrice(order.totalAmount)}</p>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleMarkShipped(order.id)}
                                className="mt-2 rounded-lg text-xs"
                              >
                                <Truck className="h-3 w-3 mr-1" />
                                Đã giao
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Truck className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="font-medium text-foreground mb-1">Chưa có đơn sẵn sàng giao</p>
              <p className="text-sm text-muted-foreground">
                Các đơn hàng sẵn sàng giao sẽ hiển thị ở đây
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Shipment History */}
      {shipmentGroups.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Lịch sử gom ship</h2>
          <div className="space-y-3">
            {shipmentGroups.map((group) => (
              <Card key={group.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{group.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {group.orders.length} đơn - {group.phone}
                      </p>
                    </div>
                    <Badge className={
                      group.status === 'SHIPPED' 
                        ? 'bg-emerald-100 text-emerald-700'
                        : group.status === 'PACKED'
                        ? 'bg-cyan-100 text-cyan-700'
                        : 'bg-amber-100 text-amber-700'
                    }>
                      {group.status === 'SHIPPED' ? 'Đã giao' : group.status === 'PACKED' ? 'Đã đóng gói' : 'Chờ xử lý'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Hướng dẫn gom ship</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>1. Các đơn hàng của cùng một khách hàng (cùng SĐT) được nhóm lại với nhau.</p>
          <p>2. Chọn các đơn hàng muốn gom và nhấn "Gom ship" để tạo một gói giao hàng.</p>
          <p>3. Gom ship giúp tiết kiệm phí vận chuyển khi khách đặt nhiều đơn từ các chiến dịch khác nhau.</p>
        </CardContent>
      </Card>
    </div>
  )
}
