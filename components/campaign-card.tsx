'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Clock, Store } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Campaign, CampaignStatus } from '@/lib/types'
import { campaignStatusLabels } from '@/lib/types'

function getStatusColor(status: CampaignStatus): string {
  switch (status) {
    case 'OPEN':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'CLOSING_SOON':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'CLOSED':
      return 'bg-gray-100 text-gray-600 border-gray-200'
    case 'DRAFT':
      return 'bg-blue-100 text-blue-600 border-blue-200'
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

interface CampaignCardProps {
  campaign: Campaign
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const minPrice = Math.min(...campaign.options.map(o => o.price))
  const isClickable = campaign.status !== 'DRAFT' && campaign.status !== 'CLOSED'

  const cardContent = (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={campaign.imageUrl}
          alt={campaign.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <Badge className={`${getStatusColor(campaign.status)} border font-medium`}>
            {campaignStatusLabels[campaign.status]}
          </Badge>
          {campaign.options.some(o => o.label) && (
            <Badge className="bg-primary text-primary-foreground border-primary">
              {campaign.options.find(o => o.label)?.label}
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2 text-balance">
          {campaign.name}
        </h3>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
          <Store className="h-3.5 w-3.5" />
          <span>{campaign.store}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
          <Clock className="h-3.5 w-3.5" />
          <span>Đóng: {formatDate(campaign.closeDate)}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-sm text-muted-foreground">Từ</span>
          <span className="text-lg font-bold text-primary">
            {formatPrice(minPrice)}
          </span>
        </div>
      </CardContent>
    </Card>
  )

  if (isClickable) {
    return (
      <Link href={'/Demo/campaign?id=${campaign.id}'} className="block">
        {cardContent}
      </Link>
    )
  }

  return <div className="opacity-60 cursor-not-allowed">{cardContent}</div>
}
