'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Package, CheckCircle2, Truck, Clock, CreditCard } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/header'
import { BottomNav } from '@/components/bottom-nav'
import { useOrders } from '@/lib/order-context'
import { orderStatusLabels, paymentStatusLabels } from '@/lib/types'
import type { Order, OrderStatus } from '@/lib/types'

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

function getStatusIcon(status: OrderStatus) {
  switch (status) {
    case 'SUBMITTED':
    case 'CONFIRMED':
      return Clock
    case 'GROUPED_FOR_PURCHASE':
    case 'PURCHASED':
    case 'INBOUND':
      return Package
    case 'READY_TO_SHIP':
    case 'PACKED':
      return CheckCircle2
    case 'SHIPPED':
      return Truck
    case 'COMPLETED':
      return CheckCircle2
    default:
      return Clock
  }
}

function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case 'SUBMITTED':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'CONFIRMED':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200'
    case 'GROUPED_FOR_PURCHASE':
    case 'PURCHASED':
      return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'INBOUND':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'READY_TO_SHIP':
    case 'PACKED':
      return 'bg-cyan-100 text-cyan-700 border-cyan-200'
    case 'SHIPPED':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'COMPLETED':
      return 'bg-green-100 text-green-700 border-green-200'
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

const orderSteps: { status: OrderStatus; label: string }[] = [
  { status: 'SUBMITTED', label: 'Đã gửi' },
  { status: 'CONFIRMED', label: 'Đã xác nhận' },
  { status: 'PURCHASED', label: 'Đã mua hàng' },
  { status: 'INBOUND', label: 'Đang về kho' },
  { status: 'READY_TO_SHIP', label: 'Sẵn sàng giao' },
  { status: 'SHIPPED', label: 'Đang giao' },
  { status: 'COMPLETED', label: 'Hoàn thành' }
]

function getStepIndex(status: OrderStatus): number {
  const statusOrder: OrderStatus[] = ['SUBMITTED', 'CONFIRMED', 'GROUPED_FOR_PURCHASE', 'PURCHASED', 'INBOUND', 'READY_TO_SHIP', 'PACKED', 'SHIPPED', 'COMPLETED']
  return statusOrder.indexOf(status)
}

function OrderCard({ order }: { order: Order }) {
  const StatusIcon = getStatusIcon(order.status)
  const currentStepIndex = getStepIndex(order.status)

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
            <CardTitle className="text-xl text-primary">{order.orderCode}</CardTitle>
          </div>
          <Badge className={`${getStatusColor(order.status)} border`}>
            {orderStatusLabels[order.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Steps */}
        <div className="relative">
          <div className="flex justify-between mb-2">
            {orderSteps.map((step, idx) => {
              const stepIndex = getStepIndex(step.status)
              const isCompleted = currentStepIndex >= stepIndex
              const isCurrent = order.status === step.status || 
                (step.status === 'PURCHASED' && (order.status === 'GROUPED_FOR_PURCHASE' || order.status === 'PURCHASED')) ||
                (step.status === 'READY_TO_SHIP' && (order.status === 'READY_TO_SHIP' || order.status === 'PACKED'))
              
              return (
                <div key={step.status} className="flex flex-col items-center flex-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    isCompleted 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                  </div>
                  <span className={`text-[10px] mt-1 text-center hidden sm:block ${
                    isCurrent ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="absolute top-3 left-0 right-0 h-0.5 bg-muted -z-10">
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${(currentStepIndex / (orderSteps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Chiến dịch</span>
            <span className="font-medium text-right">{order.campaignName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ngày đặt</span>
            <span className="font-medium">{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Thanh toán</span>
            <Badge 
              variant="outline" 
              className={order.paymentStatus === 'PAID' 
                ? 'text-emerald-600 border-emerald-300' 
                : 'text-amber-600 border-amber-300'
              }
            >
              <CreditCard className="h-3 w-3 mr-1" />
              {paymentStatusLabels[order.paymentStatus]}
            </Badge>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-sm font-medium mb-2">Sản phẩm:</p>
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm py-1">
              <span className="text-muted-foreground">
                {item.optionName} x{item.quantity}
              </span>
              <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 border-t border-border mt-2">
            <span className="font-semibold">Tổng cộng</span>
            <span className="text-lg font-bold text-primary">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TrackingContent() {
  const searchParams = useSearchParams()
  const initialCode = searchParams.get('code') || ''
  const [searchQuery, setSearchQuery] = useState(initialCode)
  const [searchType, setSearchType] = useState<'code' | 'phone'>('code')
  const { getOrderByCode, getOrdersByPhone } = useOrders()

  const [results, setResults] = useState<Order[]>(() => {
    if (initialCode) {
      const order = getOrderByCode(initialCode)
      return order ? [order] : []
    }
    return []
  })
  const [searched, setSearched] = useState(!!initialCode)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setSearched(true)
    if (searchType === 'code') {
      const order = getOrderByCode(searchQuery.trim())
      setResults(order ? [order] : [])
    } else {
      setResults(getOrdersByPhone(searchQuery.trim()))
    }
  }

  return (
    <main className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Tra cứu đơn hàng</h1>
        <p className="text-muted-foreground">
          Nhập mã đơn hàng hoặc số điện thoại để kiểm tra trạng thái
        </p>
      </div>

      {/* Search Form */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={searchType === 'code' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchType('code')}
                className="rounded-xl"
              >
                Mã đơn hàng
              </Button>
              <Button
                type="button"
                variant={searchType === 'phone' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchType('phone')}
                className="rounded-xl"
              >
                Số điện thoại
              </Button>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchType === 'code' ? 'GO2026xxxx' : '0912345678'}
                  className="pl-10 rounded-xl"
                />
              </div>
              <Button type="submit" className="rounded-xl px-6">
                Tìm kiếm
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {searched && (
        <div>
          {results.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Tìm thấy {results.length} đơn hàng
              </p>
              {results.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">
                  Không tìm thấy đơn hàng
                </h3>
                <p className="text-sm text-muted-foreground">
                  Vui lòng kiểm tra lại {searchType === 'code' ? 'mã đơn hàng' : 'số điện thoại'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!searched && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">
            Nhập thông tin để bắt đầu tra cứu
          </p>
        </div>
      )}
    </main>
  )
}

export default function TrackPage() {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <Header />
      <Suspense fallback={
        <div className="container mx-auto px-4 py-6 text-center">
          <p>Đang tải...</p>
        </div>
      }>
        <TrackingContent />
      </Suspense>
      <BottomNav />
    </div>
  )
}
