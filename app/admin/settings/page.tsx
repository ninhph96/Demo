'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Layout, Palette, Image as ImageIcon, Loader2 } from 'lucide-react'

export default function AdminSettings() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    site_name: '',
    hero_title: '',
    hero_subtitle: '',
    hero_bg_color: '#8B7CFF',
    footer_text: '',
    logo_url: '' // Thêm logo
  })

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('site_settings').select('*').single()
      if (data) setSettings(data)
    }
    load()
  }, [])

  const handleUploadLogo = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    const fileName = `logo_${Date.now()}`
    await supabase.storage.from('images').upload(`Bank/${fileName}`, file)
    const url = supabase.storage.from('images').getPublicUrl(`Bank/${fileName}`).data.publicUrl
    setSettings({...settings, logo_url: url})
    setLoading(false)
  }

  const save = async () => {
    setLoading(true)
    await supabase.from('site_settings').update(settings).eq('id', 'main')
    alert("Ninh ơi, đã cập nhật toàn bộ giao diện rồi nhé!")
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 pb-20">
      <h1 className="text-3xl font-black italic uppercase text-[#8B7CFF]">Cấu hình hệ thống</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Phần 1: Thương hiệu */}
        <Card className="rounded-[32px] border-none shadow-xl overflow-hidden">
          <CardHeader className="bg-gray-50 border-b"><CardTitle className="text-sm flex items-center gap-2"><ImageIcon className="w-4 h-4"/> Thương hiệu & Logo</CardTitle></CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-center mb-4">
               <div className="w-20 h-20 rounded-full border-4 border-purple-50 overflow-hidden shadow-inner bg-gray-50">
                  <img src={settings.logo_url || 'https://placehold.co/100'} className="w-full h-full object-cover" />
               </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-gray-400">Tên thương hiệu (Logo chữ)</Label>
              <Input value={settings.site_name} onChange={e => setSettings({...settings, site_name: e.target.value})} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-gray-400">Thay đổi Logo</Label>
              <Input type="file" onChange={handleUploadLogo} className="rounded-xl" />
            </div>
          </CardContent>
        </Card>

        {/* Phần 2: Banner Hero */}
        <Card className="rounded-[32px] border-none shadow-xl overflow-hidden">
          <CardHeader className="bg-gray-50 border-b"><CardTitle className="text-sm flex items-center gap-2"><Palette className="w-4 h-4"/> Màu sắc & Banner</CardTitle></CardHeader>
          <CardContent className="p-6 space-y-4">
             <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-gray-400">Màu chủ đạo (Banner)</Label>
              <div className="flex gap-2">
                <Input value={settings.hero_bg_color} onChange={e => setSettings({...settings, hero_bg_color: e.target.value})} className="rounded-xl" />
                <div className="w-12 h-10 rounded-xl border-4 border-white shadow-sm" style={{ backgroundColor: settings.hero_bg_color }} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-gray-400">Tiêu đề lớn (Dùng &lt;br/&gt; để xuống dòng)</Label>
              <Input value={settings.hero_title} onChange={e => setSettings({...settings, hero_title: e.target.value})} className="rounded-xl" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={save} disabled={loading} className="w-full h-16 rounded-[28px] bg-[#8B7CFF] text-lg font-black shadow-lg shadow-purple-200 uppercase italic">
        {loading ? <Loader2 className="animate-spin mr-2" /> : 'Lưu tất cả thay đổi'}
      </Button>
    </div>
  )
}
