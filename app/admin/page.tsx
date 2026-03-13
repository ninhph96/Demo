'use client'

import { Megaphone, ShoppingCart, DollarSign, Package, TrendingUp, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useOrders } from '@/lib/order-context'
import { orderStatusLabels, campaignStatusLabels } from '@/lib/types'
import Link from 'next/link'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit'
  })
}

export default function AdminDashboard() {
  const { campaigns, orders } = useOrders()

  const activeCampaigns = campaigns.filter(c => c.status === 'OPEN' || c.status === 'CLOSING_SOON')
  const totalRevenue = orders.filter(o => o.paymentStatus === 'PAID').reduce((sum, o) => sum + o.totalAmount, 0)
  const pendingOrders = orders.filter(o => o.status === 'SUBMITTED' || o.paymentStatus === 'UNPAID')
  const readyToShip = orders.filter(o => o.status === 'READY_TO_SHIP')

  const recentOrders = [...orders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5)

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Tổng quan hệ thống quản lý Group Order</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Megaphone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeCampaigns.length}</p>
                <p className="text-sm text-muted-foreground">Chiến dịch đang mở</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-100">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{formatPrice(totalRevenue)}</p>
                <p className="text-sm text-muted-foreground">Doanh thu đã thu</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-100">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingOrders.length}</p>
                <p className="text-sm text-muted-foreground">Đơn chờ xử lý</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-cyan-100">
                <Package className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{readyToShip.length}</p>
                <p className="text-sm text-muted-foreground">Sẵn sàng giao</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Chiến dịch đang hoạt động</CardTitle>
            <Link href="/admin/campaigns" className="text-sm text-primary hover:underline">
              Xem tất cả
            </Link>
          </CardHeader>
          <CardContent>
            {activeCampaigns.length > 0 ? (
              <div className="space-y-3">
                {activeCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {campaign.store} - Đóng: {formatDate(campaign.closeDate)}
                      </p>
                    </div>
                    <Badge className={campaign.status === 'CLOSING_SOON' 
                      ? 'bg-amber-100 text-amber-700 border-amber-200'
                      : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    }>
                      {campaignStatusLabels[campaign.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Chưa có chiến dịch nào đang mở
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Đơn hàng gần đây</CardTitle>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline">
              Xem tất cả
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{order.orderCode}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {order.customerName} - {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className="text-xs">
                        {orderStatusLabels[order.status]}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          order.paymentStatus === 'PAID' 
                            ? 'text-emerald-600 border-emerald-300' 
                            : 'text-amber-600 border-amber-300'
                        }`}
                      >
                        {order.paymentStatus === 'PAID' ? 'Đã TT' : 'Chưa TT'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Chưa có đơn hàng nào
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
