'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

interface OrderContextType {
  campaigns: any[]
  orders: any[]
  loading: boolean
  refreshData: () => Promise<void>
  updateOrderStatus: (orderId: string, status: string) => Promise<void>
  getGroupPurchaseData: () => any[]
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      // Lấy chiến dịch
      const { data: cpData } = await supabase.from('campaigns').select('*, campaign_options(*)')
      if (cpData) setCampaigns(cpData)

      // Lấy đơn hàng kèm chi tiết sản phẩm
      const { data: orData } = await supabase
        .from('orders')
        .select('*, order_items(*, campaign_options(*))')
        .order('created_at', { ascending: false })
      if (orData) setOrders(orData)
    } catch (error) {
      console.error('Lỗi lấy dữ liệu:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
    if (!error) fetchData()
  }

  // Hàm gom đơn để trang Group Purchase hoạt động
  const getGroupPurchaseData = () => {
    const groupMap = new Map()

    orders.forEach(order => {
      if (order.status === 'SUBMITTED' || order.status === 'CONFIRMED') {
        order.order_items?.forEach((item: any) => {
          const key = item.option_id
          const existing = groupMap.get(key) || {
            campaignName: item.campaign_options?.version || 'N/A',
            optionName: item.campaign_options?.version || 'N/A',
            totalQuantity: 0,
            orders: []
          }
          groupMap.set(key, {
            ...existing,
            totalQuantity: existing.totalQuantity + (item.quantity || 1),
            orders: [...existing.orders, order.id]
          })
        })
      }
    })
    return Array.from(groupMap.values())
  }

  return (
    <OrderContext.Provider value={{ 
      campaigns, 
      orders, 
      loading, 
      refreshData: fetchData, 
      updateOrderStatus,
      getGroupPurchaseData 
    }}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (context === undefined) throw new Error('useOrders must be used within OrderProvider')
  return context
}
