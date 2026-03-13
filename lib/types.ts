// Campaign Types
export type CampaignStatus = 'DRAFT' | 'OPEN' | 'CLOSING_SOON' | 'CLOSED'

export interface CampaignOption {
  id: string
  version: string
  price: number
  benefit?: string
  label?: string
}

export interface Campaign {
  id: string
  name: string
  store: string
  imageUrl: string
  status: CampaignStatus
  closeDate: string
  description?: string
  options: CampaignOption[]
  createdAt: string
}

// Order Types
export type OrderStatus = 
  | 'SUBMITTED' 
  | 'CONFIRMED' 
  | 'GROUPED_FOR_PURCHASE' 
  | 'PURCHASED' 
  | 'INBOUND'
  | 'READY_TO_SHIP' 
  | 'PACKED' 
  | 'SHIPPED' 
  | 'COMPLETED'

export type PaymentStatus = 'UNPAID' | 'PAID'

export interface OrderItem {
  optionId: string
  optionName: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  orderCode: string
  campaignId: string
  campaignName: string
  customerName: string
  phone: string
  socialMediaId?: string
  address: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  createdAt: string
  notes?: string
}

// Group Purchase Types
export interface GroupPurchaseItem {
  campaignId: string
  campaignName: string
  store: string
  optionId: string
  optionName: string
  totalQuantity: number
  orders: string[] // order IDs
}

// Shipment Types
export interface ShipmentGroup {
  id: string
  customerName: string
  phone: string
  address: string
  orders: Order[]
  status: 'PENDING' | 'PACKED' | 'SHIPPED'
  createdAt: string
}

// Status Labels in Vietnamese
export const campaignStatusLabels: Record<CampaignStatus, string> = {
  DRAFT: 'Nháp',
  OPEN: 'Đang mở',
  CLOSING_SOON: 'Sắp đóng',
  CLOSED: 'Đã đóng'
}

export const orderStatusLabels: Record<OrderStatus, string> = {
  SUBMITTED: 'Đã gửi',
  CONFIRMED: 'Đã xác nhận',
  GROUPED_FOR_PURCHASE: 'Đã gom đơn',
  PURCHASED: 'Đã mua hàng',
  INBOUND: 'Đang về kho',
  READY_TO_SHIP: 'Sẵn sàng giao',
  PACKED: 'Đã đóng gói',
  SHIPPED: 'Đang giao',
  COMPLETED: 'Hoàn thành'
}

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  UNPAID: 'Chưa thanh toán',
  PAID: 'Đã thanh toán'
}

export const storeOptions = [
  'Weverse',
  'Ktown4u',
  'YES24',
  'Aladin',
  'Interpark',
  'Apple Music',
  'Cokodive',
  'Khác'
]
