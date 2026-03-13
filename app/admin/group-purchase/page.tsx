'use client'

import { useState } from 'react'
import { Package, ShoppingCart, CheckCircle2, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

export default function GroupPurchasePage() {
  const { campaigns, orders, getGroupPurchaseData, updateOrderStatus } = useOrders()
  const [storeFilter, setStoreFilter] = useState<string>('ALL')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const groupPurchaseData = getGroupPurchaseData()
  
  const filteredData = groupPurchaseData.filter(item => {
    if (storeFilter === 'ALL') return true
    return item.store === storeFilter
  })

  // Get unique stores
  const stores = [...new Set(groupPurchaseData.map(item => item.store))]

  // Calculate totals
  const totalItems = filteredData.reduce((sum, item) => sum + item.totalQuantity, 0)
  const totalOrders = [...new Set(filteredData.flatMap(item => item.orders))].length

  const toggleSelectItem = (key: string) => {
    setSelectedItems(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    )
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredData.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredData.map(item => `${item.campaignId}-${item.optionId}`))
    }
  }

  const markAsPurchased = () => {
    // Get all unique order IDs from selected items
    const orderIds = new Set<string>()
    selectedItems.forEach(key => {
      const item = filteredData.find(d => `${d.campaignId}-${d.optionId}` === key)
      if (item) {
        item.orders.forEach(orderId => orderIds.add(orderId))
      }
    })

    // Update all orders to PURCHASED
    orderIds.forEach(orderId => {
      updateOrderStatus(orderId, 'PURCHASED')
    })

    setSelectedItems([])
    alert(`Đã cập nhật ${orderIds.size} đơn hàng sang trạng thái "Đã mua hàng"`)
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Gom đơn mua hàng</h1>
        <p className="text-muted-foreground">Xem tổng số lượng cần mua theo từng phiên bản</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalItems}</p>
                <p className="text-sm text-muted-foreground">Tổng sản phẩm</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100">
                <ShoppingCart className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
                <p className="text-sm text-muted-foreground">Đơn hàng</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Store className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stores.length}</p>
                <p className="text-sm text-muted-foreground">Cửa hàng</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{filteredData.length}</p>
                <p className="text-sm text-muted-foreground">Phiên bản</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <Select value={storeFilter} onValueChange={setStoreFilter}>
              <SelectTrigger className="w-[200px] rounded-xl">
                <SelectValue placeholder="Lọc theo cửa hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả cửa hàng</SelectItem>
                {stores.map(store => (
                  <SelectItem key={store} value={store}>{store}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedItems.length > 0 && (
              <Button onClick={markAsPurchased} className="rounded-xl">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Đánh dấu đã mua ({selectedItems.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Group Purchase Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedItems.length === filteredData.length && filteredData.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Chiến dịch</TableHead>
                  <TableHead>Cửa hàng</TableHead>
                  <TableHead>Phiên bản</TableHead>
                  <TableHead className="text-right">Số lượng</TableHead>
                  <TableHead className="text-right">Số đơn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => {
                    const key = `${item.campaignId}-${item.optionId}`
                    const isSelected = selectedItems.includes(key)
                    
                    return (
                      <TableRow key={key} className={isSelected ? 'bg-primary/5' : ''}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelectItem(key)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{item.campaignName}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.store}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{item.optionName}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-xl font-bold text-primary">
                            {item.totalQuantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-muted-foreground">
                            {item.orders.length} đơn
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="font-medium text-foreground mb-1">Chưa có đơn cần gom</p>
                      <p className="text-sm text-muted-foreground">
                        Các đơn hàng đã xác nhận sẽ hiển thị ở đây
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Hướng dẫn</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>1. Trang này hiển thị tổng số lượng sản phẩm cần mua từ các đơn hàng đã xác nhận.</p>
          <p>2. Lọc theo cửa hàng để dễ dàng gom đơn mua hàng từ cùng một nguồn.</p>
          <p>3. Sau khi đặt hàng từ shop, chọn các item và nhấn "Đánh dấu đã mua" để cập nhật trạng thái.</p>
        </CardContent>
      </Card>
    </div>
  )
}
