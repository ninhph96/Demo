'use client'

import { useState } from 'react'
import { Package, Warehouse, ArrowRight, CheckCircle2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useOrders } from '@/lib/order-context'
import { orderStatusLabels } from '@/lib/types'
import type { OrderStatus } from '@/lib/types'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN')
}

function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case 'PURCHASED': return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'INBOUND': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'READY_TO_SHIP': return 'bg-cyan-100 text-cyan-700 border-cyan-200'
    default: return 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

export default function WarehousePage() {
  const { orders, campaigns, updateOrderStatus } = useOrders()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])

  // Filter orders for warehouse management (PURCHASED, INBOUND, READY_TO_SHIP)
  const warehouseStatuses: OrderStatus[] = ['PURCHASED', 'INBOUND', 'READY_TO_SHIP']
  
  const warehouseOrders = orders.filter(order => {
    if (!warehouseStatuses.includes(order.status)) return false
    
    if (search) {
      const searchLower = search.toLowerCase()
      if (!order.orderCode.toLowerCase().includes(searchLower) &&
          !order.customerName.toLowerCase().includes(searchLower)) {
        return false
      }
    }
    
    if (statusFilter !== 'ALL' && order.status !== statusFilter) return false
    
    return true
  })

  const purchasedCount = orders.filter(o => o.status === 'PURCHASED').length
  const inboundCount = orders.filter(o => o.status === 'INBOUND').length
  const readyToShipCount = orders.filter(o => o.status === 'READY_TO_SHIP').length

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedOrders.length === warehouseOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(warehouseOrders.map(o => o.id))
    }
  }

  const updateSelectedStatus = (newStatus: OrderStatus) => {
    selectedOrders.forEach(orderId => {
      updateOrderStatus(orderId, newStatus)
    })
    setSelectedOrders([])
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Quản lý kho hàng</h1>
        <p className="text-muted-foreground">Cập nhật trạng thái hàng hóa từ mua đến sẵn sàng giao</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className={statusFilter === 'PURCHASED' ? 'ring-2 ring-primary' : ''}>
          <CardContent className="pt-4 pb-4">
            <button 
              onClick={() => setStatusFilter(statusFilter === 'PURCHASED' ? 'ALL' : 'PURCHASED')}
              className="w-full text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{purchasedCount}</p>
                  <p className="text-sm text-muted-foreground">Đã mua hàng</p>
                </div>
              </div>
            </button>
          </CardContent>
        </Card>
        
        <Card className={statusFilter === 'INBOUND' ? 'ring-2 ring-primary' : ''}>
          <CardContent className="pt-4 pb-4">
            <button 
              onClick={() => setStatusFilter(statusFilter === 'INBOUND' ? 'ALL' : 'INBOUND')}
              className="w-full text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Warehouse className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{inboundCount}</p>
                  <p className="text-sm text-muted-foreground">Đang về kho</p>
                </div>
              </div>
            </button>
          </CardContent>
        </Card>
        
        <Card className={statusFilter === 'READY_TO_SHIP' ? 'ring-2 ring-primary' : ''}>
          <CardContent className="pt-4 pb-4">
            <button 
              onClick={() => setStatusFilter(statusFilter === 'READY_TO_SHIP' ? 'ALL' : 'READY_TO_SHIP')}
              className="w-full text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-100">
                  <CheckCircle2 className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{readyToShipCount}</p>
                  <p className="text-sm text-muted-foreground">Sẵn sàng giao</p>
                </div>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo mã đơn, tên khách..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>

            {selectedOrders.length > 0 && (
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => updateSelectedStatus('INBOUND')}
                  className="rounded-xl"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Đang về kho ({selectedOrders.length})
                </Button>
                <Button 
                  onClick={() => updateSelectedStatus('READY_TO_SHIP')}
                  className="rounded-xl"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Sẵn sàng giao ({selectedOrders.length})
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Warehouse Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedOrders.length === warehouseOrders.length && warehouseOrders.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Chiến dịch</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouseOrders.length > 0 ? (
                  warehouseOrders.map((order) => (
                    <TableRow key={order.id} className={selectedOrders.includes(order.id) ? 'bg-primary/5' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={selectedOrders.includes(order.id)}
                          onCheckedChange={() => toggleSelectOrder(order.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-primary">{order.orderCode}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-sm text-muted-foreground">{order.phone}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[150px] truncate">{order.campaignName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {order.items.map((item, idx) => (
                            <div key={idx}>{item.optionName} x{item.quantity}</div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(order.status)} border`}>
                          {orderStatusLabels[order.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {order.status === 'PURCHASED' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, 'INBOUND')}
                              className="rounded-lg text-xs"
                            >
                              Về kho
                            </Button>
                          )}
                          {order.status === 'INBOUND' && (
                            <Button 
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'READY_TO_SHIP')}
                              className="rounded-lg text-xs"
                            >
                              Sẵn sàng
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Warehouse className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="font-medium text-foreground mb-1">Kho hàng trống</p>
                      <p className="text-sm text-muted-foreground">
                        Chưa có đơn hàng nào trong kho
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Flow Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Quy trình xử lý kho</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <Badge className="bg-purple-100 text-purple-700">Đã mua hàng</Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge className="bg-amber-100 text-amber-700">Đang về kho</Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge className="bg-cyan-100 text-cyan-700">Sẵn sàng giao</Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Gom ship</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
