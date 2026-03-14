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

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

export default function ShipmentsPage() {
  // Lấy data từ context (Không còn useAuth ở đây)
  const { orders = [], shipmentGroups = [], createShipmentGroup, updateOrderStatus, loading } = useOrders()
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [expandedCustomers, setExpandedCustomers] = useState<string[]>([])

  // Lọc đơn sẵn sàng (READY_TO_SHIP hoặc SUBMITTED tùy Ninh cấu hình)
  const readyToShipOrders = orders.filter((o: any) => o.status === 'READY_TO_SHIP' || o.status === 'SUBMITTED')

  const customerGroups = useMemo(() => {
    const groups: any = {}
    readyToShipOrders.forEach((order: any) => {
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
      groups[order.phone].totalAmount += order.totalAmount
    })
    return Object.values(groups)
  }, [readyToShipOrders])

  const toggleExpand = (phone: string) => {
    setExpandedCustomers(prev => prev.includes(phone) ? prev.filter(p => p !== phone) : [...prev, phone])
  }

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId])
  }

  const selectAllFromCustomer = (group: any) => {
    const orderIds = group.orders.map((o: any) => o.id)
    const allSelected = orderIds.every((id: any) => selectedOrders.includes(id))
    if (allSelected) {
      setSelectedOrders(prev => prev.filter(id => !orderIds.includes(id)))
    } else {
      setSelectedOrders(prev => [...new Set([...prev, ...orderIds])])
    }
  }

  const handleCreateShipment = () => {
    if (selectedOrders.length === 0) return
    createShipmentGroup(selectedOrders)
    setSelectedOrders([])
    alert('Fangirl\'s Diary Shop đã gom đơn thành công!')
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-gray-300 uppercase">Đang tải dữ liệu vận chuyển...</div>

  return (
    <div className="p-4 lg:p-6 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-black italic uppercase text-gray-800">Gom ship & Vận chuyển</h1>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Gom đơn theo khách hàng để tối ưu phí vận chuyển</p>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
         <Card className="rounded-3xl border-none shadow-sm p-4 flex items-center gap-3 bg-white">
            <div className="p-3 rounded-2xl bg-cyan-50"><Package className="h-5 w-5 text-cyan-500" /></div>
            <div><p className="text-xl font-black italic">{readyToShipOrders.length}</p><p className="text-[9px] font-bold text-gray-400 uppercase">Đơn sẵn sàng</p></div>
         </Card>
         <Card className="rounded-3xl border-none shadow-sm p-4 flex items-center gap-3 bg-white">
            <div className="p-3 rounded-2xl bg-indigo-50"><Users className="h-5 w-5 text-indigo-500" /></div>
            <div><p className="text-xl font-black italic">{customerGroups.length}</p><p className="text-[9px] font-bold text-gray-400 uppercase">Khách hàng</p></div>
         </Card>
      </div>

      {/* Action Bar khi chọn đơn */}
      {selectedOrders.length > 0 && (
        <Card className="mb-6 border-[#8B7CFF] bg-[#F7F6FF] rounded-[30px] shadow-lg animate-in fade-in slide-in-from-bottom-4">
          <CardContent className="py-4 flex items-center justify-between">
            <p className="font-black italic uppercase text-[#8B7CFF] text-sm">Đã chọn {selectedOrders.length} đơn hàng</p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setSelectedOrders([])} className="rounded-xl font-bold text-xs uppercase text-gray-400">Bỏ chọn</Button>
              <Button onClick={handleCreateShipment} className="rounded-xl bg-[#8B7CFF] font-black italic uppercase text-xs shadow-lg">Gom ship ngay</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List đơn hàng theo khách */}
      <div className="space-y-4">
        {customerGroups.map((group: any) => (
          <Card key={group.phone} className="rounded-[35px] border-none shadow-sm overflow-hidden bg-white">
            <Collapsible open={expandedCustomers.includes(group.phone)} onOpenChange={() => toggleExpand(group.phone)}>
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Checkbox checked={group.orders.every((o: any) => selectedOrders.includes(o.id))} onCheckedChange={() => selectAllFromCustomer(group)} />
                  <div>
                    <h3 className="font-black italic uppercase text-gray-800 flex items-center gap-2">
                      {group.customerName} <Badge variant="secondary" className="rounded-lg text-[9px]">{group.orders.length} đơn</Badge>
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 flex items-center gap-3 mt-1 uppercase">
                      <span><Phone className="h-3 w-3 inline mr-1" /> {group.phone}</span>
                      <span><MapPin className="h-3 w-3 inline mr-1" /> {group.address}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="text-right hidden md:block">
                      <p className="font-black text-[#8B7CFF]">{formatPrice(group.totalAmount)}</p>
                   </div>
                   <CollapsibleTrigger asChild><Button variant="ghost" size="icon"><ChevronDown className="h-4 w-4" /></Button></CollapsibleTrigger>
                </div>
              </div>
              <CollapsibleContent className="px-6 pb-6 pt-2 border-t border-dashed border-gray-100">
                <div className="space-y-3 mt-4">
                  {group.orders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-[#8B7CFF]/20 transition-all">
                      <div className="flex items-center gap-3">
                        <Checkbox checked={selectedOrders.includes(order.id)} onCheckedChange={() => toggleSelectOrder(order.id)} />
                        <div>
                          <p className="font-black text-[11px] text-[#8B7CFF] uppercase italic">{order.orderCode}</p>
                          <p className="text-xs font-bold text-gray-600 mt-0.5">Tiền hàng: {formatPrice(order.totalAmount)}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, 'SHIPPED')} className="rounded-xl font-black italic uppercase text-[9px] border-gray-200">Đã giao</Button>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  )
}
