import type { Campaign, Order } from './types'

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'BTS - MOTS:7 Repackage',
    store: 'Weverse',
    imageUrl: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=400&h=400&fit=crop',
    status: 'OPEN',
    closeDate: '2026-03-20',
    description: 'Album mới nhất từ BTS với nhiều phiên bản độc quyền',
    options: [
      { id: 'opt1', version: 'Version 1', price: 450000, benefit: 'Poster', label: 'Hot' },
      { id: 'opt2', version: 'Version 2', price: 450000, benefit: 'Photocard' },
      { id: 'opt3', version: 'Version 3', price: 450000, benefit: 'Sticker Set' },
      { id: 'opt4', version: 'Full Set (3 ver)', price: 1200000, benefit: 'All + Special Gift', label: 'Best Deal' }
    ],
    createdAt: '2026-03-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'BLACKPINK - Born Pink',
    store: 'Ktown4u',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    status: 'CLOSING_SOON',
    closeDate: '2026-03-15',
    description: 'Album comeback sau 2 năm của BLACKPINK',
    options: [
      { id: 'opt5', version: 'Box Set - Black', price: 650000, benefit: 'Exclusive PC', label: 'Limited' },
      { id: 'opt6', version: 'Box Set - Pink', price: 650000, benefit: 'Exclusive PC' },
      { id: 'opt7', version: 'Digipack', price: 280000 }
    ],
    createdAt: '2026-02-15T00:00:00Z'
  },
  {
    id: '3',
    name: 'NewJeans - OMG',
    store: 'YES24',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
    status: 'OPEN',
    closeDate: '2026-03-25',
    description: 'Single album mới với concept tươi trẻ',
    options: [
      { id: 'opt8', version: 'Message Card Ver. - Minji', price: 180000 },
      { id: 'opt9', version: 'Message Card Ver. - Hanni', price: 180000 },
      { id: 'opt10', version: 'Message Card Ver. - Danielle', price: 180000 },
      { id: 'opt11', version: 'Message Card Ver. - Haerin', price: 180000 },
      { id: 'opt12', version: 'Message Card Ver. - Hyein', price: 180000 },
      { id: 'opt13', version: 'Full Set (5 ver)', price: 800000, label: 'Best Deal' }
    ],
    createdAt: '2026-03-05T00:00:00Z'
  },
  {
    id: '4',
    name: 'SEVENTEEN - FML',
    store: 'Interpark',
    imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=400&fit=crop',
    status: 'CLOSED',
    closeDate: '2026-03-01',
    description: 'Full album thứ 4 của SEVENTEEN',
    options: [
      { id: 'opt14', version: 'Ver. Fight', price: 420000 },
      { id: 'opt15', version: 'Ver. Melt', price: 420000 },
      { id: 'opt16', version: 'Ver. Love', price: 420000 }
    ],
    createdAt: '2026-02-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'aespa - Drama',
    store: 'Weverse',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    status: 'DRAFT',
    closeDate: '2026-04-01',
    description: 'Mini album thứ 4 với concept drama',
    options: [
      { id: 'opt17', version: 'Sequence Ver.', price: 380000 },
      { id: 'opt18', version: 'Giant Ver.', price: 520000 }
    ],
    createdAt: '2026-03-10T00:00:00Z'
  }
]

export const mockOrders: Order[] = [
  {
    id: 'ord1',
    orderCode: 'GO20260001',
    campaignId: '1',
    campaignName: 'BTS - MOTS:7 Repackage',
    customerName: 'Nguyễn Thị Mai',
    phone: '0912345678',
    socialMediaId: '@mai.bts.fan',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    items: [
      { optionId: 'opt1', optionName: 'Version 1', quantity: 1, price: 450000 },
      { optionId: 'opt2', optionName: 'Version 2', quantity: 1, price: 450000 }
    ],
    totalAmount: 900000,
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    createdAt: '2026-03-05T10:30:00Z'
  },
  {
    id: 'ord2',
    orderCode: 'GO20260002',
    campaignId: '1',
    campaignName: 'BTS - MOTS:7 Repackage',
    customerName: 'Trần Văn An',
    phone: '0987654321',
    socialMediaId: '@an_army',
    address: '456 Lê Lợi, Quận 3, TP.HCM',
    items: [
      { optionId: 'opt4', optionName: 'Full Set (3 ver)', quantity: 1, price: 1200000 }
    ],
    totalAmount: 1200000,
    status: 'SUBMITTED',
    paymentStatus: 'UNPAID',
    createdAt: '2026-03-06T14:20:00Z'
  },
  {
    id: 'ord3',
    orderCode: 'GO20260003',
    campaignId: '2',
    campaignName: 'BLACKPINK - Born Pink',
    customerName: 'Lê Thị Hồng',
    phone: '0909123456',
    address: '789 Trần Hưng Đạo, Quận 5, TP.HCM',
    items: [
      { optionId: 'opt5', optionName: 'Box Set - Black', quantity: 2, price: 650000 }
    ],
    totalAmount: 1300000,
    status: 'READY_TO_SHIP',
    paymentStatus: 'PAID',
    createdAt: '2026-02-20T09:15:00Z'
  },
  {
    id: 'ord4',
    orderCode: 'GO20260004',
    campaignId: '3',
    campaignName: 'NewJeans - OMG',
    customerName: 'Phạm Minh Tuấn',
    phone: '0912345678',
    socialMediaId: '@tuan.bunny',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    items: [
      { optionId: 'opt13', optionName: 'Full Set (5 ver)', quantity: 1, price: 800000 }
    ],
    totalAmount: 800000,
    status: 'PURCHASED',
    paymentStatus: 'PAID',
    createdAt: '2026-03-08T16:45:00Z'
  },
  {
    id: 'ord5',
    orderCode: 'GO20260005',
    campaignId: '2',
    campaignName: 'BLACKPINK - Born Pink',
    customerName: 'Nguyễn Thị Mai',
    phone: '0912345678',
    socialMediaId: '@mai.bts.fan',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    items: [
      { optionId: 'opt7', optionName: 'Digipack', quantity: 1, price: 280000 }
    ],
    totalAmount: 280000,
    status: 'READY_TO_SHIP',
    paymentStatus: 'PAID',
    createdAt: '2026-02-22T11:00:00Z'
  }
]
