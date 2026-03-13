'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Layout, Palette, Type } from 'lucide-react'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    site_name: '',
    hero_title: '',
    hero_subtitle: '',
    hero_bg_color: '',
    footer_text: ''
  })

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('site_settings').select('*').single()
      if (data) setSettings(data)
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setLoading(true)
    const { error } = await supabase.from('site_settings').update(settings).eq('id', 'main')
    if (!error) alert("Đã cập nhật giao diện thành công!")
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-black uppercase italic text-[#8B7CFF]">Cấu hình giao diện</h1>

      <Card className="rounded-[32px] border-none shadow-lg">
        <CardHeader><CardTitle className="flex items-center gap-2"><Layout className="h-5 w-5"/> Header & Footer</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tên Website (Logo chữ)</Label>
            <Input value={settings.site_name} onChange={e => setSettings({...settings, site_name: e.target.value})} className="rounded-xl" />
          </div>
          <div>
            <Label>Thông tin Footer</Label>
            <Input value={settings.footer_text} onChange={e => setSettings({...settings, footer_text: e.target.value})} className="rounded-xl" />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[32px] border-none shadow-lg">
        <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5"/> Banner Hero (Ô màu tím)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tiêu đề lớn</Label>
            <Input value={settings.hero_title} onChange={e => setSettings({...settings, hero_title: e.target.value})} className="rounded-xl" />
          </div>
          <div>
            <Label>Mô tả ngắn</Label>
            <Input value={settings.hero_subtitle} onChange={e => setSettings({...settings, hero_subtitle: e.target.value})} className="rounded-xl" />
          </div>
          <div>
            <Label>Màu nền (Mã màu Hex)</Label>
            <div className="flex gap-2">
              <Input value={settings.hero_bg_color} onChange={e => setSettings({...settings, hero_bg_color: e.target.value})} className="rounded-xl" />
              <div className="w-12 h-10 rounded-xl border" style={{ backgroundColor: settings.hero_bg_color }} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} className="w-full h-14 rounded-[24px] bg-[#8B7CFF] font-black shadow-lg">
        {loading ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
      </Button>
    </div>
  )
}
