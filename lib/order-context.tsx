'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { Campaign, Order, ShipmentGroup, OrderStatus, PaymentStatus, CampaignStatus } from './types'
import { mockCampaigns, mockOrders } from './mock-data'

interface OrderContextType {
  campaigns: Campaign[]
  orders: Order[]
  shipmentGroups: ShipmentGroup[]
  
  // Campaign actions
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt'>) => void
  updateCampaign: (id: string, updates: Partial<Campaign>) => void
  deleteCampaign: (id: string) => void
  
  // Order actions
  addOrder: (order: Omit<Order, 'id' | 'orderCode' | 'createdAt'>) => void
  updateOrderStatus: (id: string, status: OrderStatus) => void
  updatePaymentStatus: (id: string, status: PaymentStatus) => void
  
  // Shipment actions
  createShipmentGroup: (orderIds: string[]) => void
  updateShipmentStatus: (id: string, status: ShipmentGroup['status']) => void
  
  // Queries
  getCampaignById: (id: string) => Campaign | undefined
  getOrderByCode: (code: string) => Order | undefined
  getOrdersByPhone: (phone: string) => Order[]
  getOrdersByCampaign: (campaignId: string) => Order[]
  getGroupPurchaseData: () => { campaignId: string; campaignName: string; store: string; optionId: string; optionName: string; totalQuantity: number; orders: string[] }[]
  getReadyToShipOrders: () => Order[]
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

function generateOrderCode(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `GO${year}${random}`
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns)
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [shipmentGroups, setShipmentGroups] = useState<ShipmentGroup[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const savedCampaigns = localStorage.getItem('kpop-go-campaigns')
    const savedOrders = localStorage.getItem('kpop-go-orders')
    const savedShipments = localStorage.getItem('kpop-go-shipments')
    
    if (savedCampaigns) setCampaigns(JSON.parse(savedCampaigns))
    if (savedOrders) setOrders(JSON.parse(savedOrders))
    if (savedShipments) setShipmentGroups(JSON.parse(savedShipments))
  }, [])

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem('kpop-go-campaigns', JSON.stringify(campaigns))
  }, [campaigns])

  useEffect(() => {
    localStorage.setItem('kpop-go-orders', JSON.stringify(orders))
  }, [orders])

  useEffect(() => {
    localStorage.setItem('kpop-go-shipments', JSON.stringify(shipmentGroups))
  }, [shipmentGroups])

  // Campaign actions
  const addCampaign = useCallback((campaign: Omit<Campaign, 'id' | 'createdAt'>) => {
    const newCampaign: Campaign = {
      ...campaign,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    setCampaigns(prev => [...prev, newCampaign])
  }, [])

  const updateCampaign = useCallback((id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }, [])

  const deleteCampaign = useCallback((id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id))
  }, [])

  // Order actions
  const addOrder = useCallback((order: Omit<Order, 'id' | 'orderCode' | 'createdAt'>) => {
    const newOrder: Order = {
      ...order,
      id: generateId(),
      orderCode: generateOrderCode(),
      createdAt: new Date().toISOString()
    }
    setOrders(prev => [...prev, newOrder])
    return newOrder
  }, [])

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }, [])

  const updatePaymentStatus = useCallback((id: string, status: PaymentStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, paymentStatus: status } : o))
  }, [])

  // Shipment actions
  const createShipmentGroup = useCallback((orderIds: string[]) => {
    const selectedOrders = orders.filter(o => orderIds.includes(o.id))
    if (selectedOrders.length === 0) return

    const firstOrder = selectedOrders[0]
    const newGroup: ShipmentGroup = {
      id: generateId(),
      customerName: firstOrder.customerName,
      phone: firstOrder.phone,
      address: firstOrder.address,
      orders: selectedOrders,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    }
    
    setShipmentGroups(prev => [...prev, newGroup])
    
    // Update order statuses to PACKED
    orderIds.forEach(id => {
      updateOrderStatus(id, 'PACKED')
    })
  }, [orders, updateOrderStatus])

  const updateShipmentStatus = useCallback((id: string, status: ShipmentGroup['status']) => {
    setShipmentGroups(prev => prev.map(g => g.id === id ? { ...g, status } : g))
    
    // If shipped, update all orders in the group
    if (status === 'SHIPPED') {
      const group = shipmentGroups.find(g => g.id === id)
      if (group) {
        group.orders.forEach(order => {
          updateOrderStatus(order.id, 'SHIPPED')
        })
      }
    }
  }, [shipmentGroups, updateOrderStatus])

  // Queries
  const getCampaignById = useCallback((id: string) => {
    return campaigns.find(c => c.id === id)
  }, [campaigns])

  const getOrderByCode = useCallback((code: string) => {
    return orders.find(o => o.orderCode.toLowerCase() === code.toLowerCase())
  }, [orders])

  const getOrdersByPhone = useCallback((phone: string) => {
    return orders.filter(o => o.phone.includes(phone))
  }, [orders])

  const getOrdersByCampaign = useCallback((campaignId: string) => {
    return orders.filter(o => o.campaignId === campaignId)
  }, [orders])

  const getGroupPurchaseData = useCallback(() => {
    const grouped: Record<string, { campaignId: string; campaignName: string; store: string; optionId: string; optionName: string; totalQuantity: number; orders: string[] }> = {}
    
    orders
      .filter(o => o.status === 'CONFIRMED' || o.status === 'GROUPED_FOR_PURCHASE')
      .forEach(order => {
        const campaign = campaigns.find(c => c.id === order.campaignId)
        if (!campaign) return
        
        order.items.forEach(item => {
          const key = `${order.campaignId}-${item.optionId}`
          if (!grouped[key]) {
            grouped[key] = {
              campaignId: order.campaignId,
              campaignName: campaign.name,
              store: campaign.store,
              optionId: item.optionId,
              optionName: item.optionName,
              totalQuantity: 0,
              orders: []
            }
          }
          grouped[key].totalQuantity += item.quantity
          if (!grouped[key].orders.includes(order.id)) {
            grouped[key].orders.push(order.id)
          }
        })
      })
    
    return Object.values(grouped)
  }, [orders, campaigns])

  const getReadyToShipOrders = useCallback(() => {
    return orders.filter(o => o.status === 'READY_TO_SHIP')
  }, [orders])

  return (
    <OrderContext.Provider value={{
      campaigns,
      orders,
      shipmentGroups,
      addCampaign,
      updateCampaign,
      deleteCampaign,
      addOrder,
      updateOrderStatus,
      updatePaymentStatus,
      createShipmentGroup,
      updateShipmentStatus,
      getCampaignById,
      getOrderByCode,
      getOrdersByPhone,
      getOrdersByCampaign,
      getGroupPurchaseData,
      getReadyToShipOrders
    }}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider')
  }
  return context
}
