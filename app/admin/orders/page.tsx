'use client'

import { useState } from 'react'
import { Search, Filter, CheckCircle2, XCircle, MoreVertical, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useOrders } from '@/lib/order-context'
import { orderStatusLabels, paymentStatusLabels } from '@/lib/types'
import type { Order, OrderStatus, PaymentStatus } from '@/lib/types'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case 'SUBMITTED': return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'CONFIRMED': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
    case 'GROUPED_FOR_PURCHASE':
    case 'PURCHASED': return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'INBOUND': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'READY_TO_SHIP':
    case 'PACKED': return 'bg-cyan-100 text-cyan-700 border-cyan-200'
    case 'SHIPPED': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200'
    default: return 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

export default function OrdersPage() {
  const { orders, campaigns, updateOrderStatus, updatePaymentStatus } = useOrders()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL')
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'ALL'>('ALL')
  const [campaignFilter, setCampaignFilter] = useState<string>('ALL')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const filteredOrders = orders.filter(order => {
    if (search) {
      const searchLower = search.toLowerCase()
      if (!order.orderCode.toLowerCase().includes(searchLower) &&
          !order.customerName.toLowerCase().includes(searchLower) &&
          !order.phone.includes(search)) {
        return false
      }
    }
    if (statusFilter !== 'ALL' && order.status !== statusFilter) return false
    if (paymentFilter !== 'ALL' && order.paymentStatus !== paymentFilter) return false
    if (campaignFilter !== 'ALL' && order.campaignId !== campaignFilter) return false
    return true
  })

  const statusOptions: OrderStatus[] = ['SUBMITTED', 'CONFIRMED', 'GROUPED_FOR_PURCHASE', 'PURCHASED', 'INBOUND', 'READY_TO_SHIP', 'PACKED', 'SHIPPED', 'COMPLETED']

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Quản lý đơn hàng</h1>
        <p className="text-muted-foreground">Xem và cập nhật trạng thái đơn hàng</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo mã đơn, tên, SĐT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | 'ALL')}>
                <SelectTrigger className="w-[160px] rounded-xl">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả TT</SelectItem>
                  {statusOptions.map(s => (
                    <SelectItem key={s} value={s}>{orderStatusLabels[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v as PaymentStatus | 'ALL')}>
                <SelectTrigger className="w-[160px] rounded-xl">
                  <SelectValue placeholder="Thanh toán" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  <SelectItem value="UNPAID">{paymentStatusLabels.UNPAID}</SelectItem>
                  <SelectItem value="PAID">{paymentStatusLabels.PAID}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                <SelectTrigger className="w-[180px] rounded-xl">
                  <SelectValue placeholder="Chiến dịch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả CD</SelectItem>
                  {campaigns.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Tổng đơn</p>
            <p className="text-2xl font-bold text-foreground">{filteredOrders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Chưa thanh toán</p>
            <p className="text-2xl font-bold text-amber-600">
              {filteredOrders.filter(o => o.paymentStatus === 'UNPAID').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Đã thanh toán</p>
            <p className="text-2xl font-bold text-emerald-600">
              {filteredOrders.filter(o => o.paymentStatus === 'PAID').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Tổng giá trị</p>
            <p className="text-xl font-bold text-primary">
              {formatPrice(filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Chiến dịch</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thanh toán</TableHead>
                  <TableHead className="w-[80px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="font-medium text-primary hover:underline"
                        >
                          {order.orderCode}
                        </button>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-sm text-muted-foreground">{order.phone}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">{order.campaignName}</div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(order.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(order.status)} border`}>
                          {orderStatusLabels[order.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={order.paymentStatus === 'PAID' 
                            ? 'text-emerald-600 border-emerald-300 bg-emerald-50' 
                            : 'text-amber-600 border-amber-300 bg-amber-50'
                          }
                        >
                          <CreditCard className="h-3 w-3 mr-1" />
                          {paymentStatusLabels[order.paymentStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {order.paymentStatus === 'UNPAID' && (
                              <DropdownMenuItem onClick={() => updatePaymentStatus(order.id, 'PAID')}>
                                <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600" />
                                Xác nhận đã thanh toán
                              </DropdownMenuItem>
                            )}
                            {order.paymentStatus === 'PAID' && (
                              <DropdownMenuItem onClick={() => updatePaymentStatus(order.id, 'UNPAID')}>
                                <XCircle className="h-4 w-4 mr-2 text-amber-600" />
                                Đánh dấu chưa thanh toán
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {order.status === 'SUBMITTED' && (
                              <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}>
                                Xác nhận đơn
                              </DropdownMenuItem>
                            )}
                            {order.status === 'CONFIRMED' && (
                              <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'GROUPED_FOR_PURCHASE')}>
                                Gom đơn mua hàng
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy đơn hàng nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">{selectedOrder.orderCode}</span>
                <Badge className={`${getStatusColor(selectedOrder.status)} border`}>
                  {orderStatusLabels[selectedOrder.status]}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Khách hàng</span>
                  <span className="font-medium">{selectedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số điện thoại</span>
                  <span className="font-medium">{selectedOrder.phone}</span>
                </div>
                {selectedOrder.socialMediaId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Social</span>
                    <span className="font-medium">{selectedOrder.socialMediaId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Địa chỉ</span>
                  <span className="font-medium text-right max-w-[200px]">{selectedOrder.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày đặt</span>
                  <span className="font-medium">{formatDate(selectedOrder.createdAt)}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="font-medium mb-2">Sản phẩm:</p>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-1">
                    <span>{item.optionName} x{item.quantity}</span>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t mt-2">
                  <span className="font-semibold">Tổng cộng</span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                {selectedOrder.paymentStatus === 'UNPAID' ? (
                  <Button 
                    className="flex-1 rounded-xl"
                    onClick={() => {
                      updatePaymentStatus(selectedOrder.id, 'PAID')
                      setSelectedOrder({ ...selectedOrder, paymentStatus: 'PAID' })
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Xác nhận thanh toán
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => {
                      updatePaymentStatus(selectedOrder.id, 'UNPAID')
                      setSelectedOrder({ ...selectedOrder, paymentStatus: 'UNPAID' })
                    }}
                  >
                    Hủy thanh toán
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
