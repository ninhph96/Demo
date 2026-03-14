'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

const OrderContext = createContext<any>(undefined)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    const { data: cp } = await supabase.from('campaigns').select('*, campaign_options(*)')
    const { data: ord } = await supabase.from('orders').select('*, order_items(*, campaign_options(*))').order('created_at', { ascending: false })
    if (cp) setCampaigns(cp)
    if (ord) setOrders(ord)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const getGroupPurchaseData = () => {
    const map = new Map()
    orders.forEach((order: any) => {
      order.order_items?.forEach((item: any) => {
        const key = item.option_id
        const existing = map.get(key) || { campaignName: item.campaign_options?.version, store: 'N/A', totalQuantity: 0, orders: [] }
        map.set(key, { ...existing, totalQuantity: existing.totalQuantity + (item.quantity || 1), orders: [...existing.orders, order.id] })
      })
    })
    return Array.from(map.values())
  }

  return (
    <OrderContext.Provider value={{ campaigns, orders, loading, refreshData: fetchData, getGroupPurchaseData }}>
      {children}
    </OrderContext.Provider>
  )
}

export const useOrders = () => useContext(OrderContext)
