import React, { useState, useEffect } from "react"
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  ImageIcon,
  X,
  Megaphone,
  Link as LinkIcon
} from "lucide-react"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card } from "../components/ui/Card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../components/ui/Table"
import { Modal } from "../components/ui/Modal"
import { adsService, productsService } from "../services/api"

const EMPTY_FORM = {
  title: "",
  description: "",
  image_url: "",
  product_id: "",
  is_active: true
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(" ")
}

const Ads = () => {
  const [ads, setAds] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAd, setEditingAd] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const fetchData = async () => {
    try {
      setLoading(true)
      const [adsData, productsData] = await Promise.all([
        adsService.getAll(),
        productsService.getAll(1, 100) // Get some products for linking
      ])
      setAds(adsData)
      setProducts(productsData)
    } catch (err) {
      console.error("Error fetching ads:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openAddModal = () => {
    setEditingAd(null)
    setFormData(EMPTY_FORM)
    setError("")
    setIsModalOpen(true)
  }

  const openEditModal = (ad) => {
    setEditingAd(ad)
    setFormData({
      title: ad.title || "",
      description: ad.description || "",
      image_url: ad.image_url || "",
      product_id: ad.product_id || "",
      is_active: ad.is_active ?? true
    })
    setError("")
    setIsModalOpen(true)
  }

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await adsService.toggleActive(id, !currentStatus)
      setAds(ads.map(ad =>
        ad.id === id ? { ...ad, is_active: !currentStatus } : ad
      ))
    } catch (err) {
      alert("خطأ في تغيير حالة الإعلان: " + err.message)
    }
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`هل أنت متأكد من حذف الإعلان "${title}"؟`)) return
    try {
      await adsService.delete(id)
      setAds(ads.filter(ad => ad.id !== id))
    } catch (err) {
      alert("خطأ في حذف الإعلان: " + err.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        image_url: formData.image_url.trim() || null,
        product_id: formData.product_id || null,
        is_active: formData.is_active
      }

      if (editingAd) {
        const updated = await adsService.update(editingAd.id, payload)
        // Refresh to get linked product info
        await fetchData()
      } else {
        const created = await adsService.create(payload)
        // Refresh to get linked product info
        await fetchData()
      }
      setIsModalOpen(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const filteredAds = ads.filter(ad =>
    ad.title?.toLowerCase().includes(search.toLowerCase()) ||
    ad.description?.toLowerCase().includes(search.toLowerCase())
  )


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة الإعلانات</h1>
          <p className="text-muted-foreground">قم بإنشاء وتعديل العروض الترويجية والإعلانات</p>
        </div>
        <Button onClick={openAddModal} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة إعلان جديد
        </Button>
      </div>

      {/* Stats/Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4 bg-primary/5 border-primary/10">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Megaphone className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold">{ads.length}</div>
            <div className="text-sm text-muted-foreground">إجمالي الإعلانات</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 bg-green-500/5 border-green-500/10">
          <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
            <Eye className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <div className="text-2xl font-bold">{ads.filter(a => a.is_active).length}</div>
            <div className="text-sm text-muted-foreground">إعلانات نشطة</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 bg-yellow-500/5 border-yellow-500/10">
          <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <LinkIcon className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <div className="text-2xl font-bold">{ads.filter(a => a.product_id).length}</div>
            <div className="text-sm text-muted-foreground">مربوطة بمنتجات</div>
          </div>
        </Card>
      </div>

      {/* Ads Card */}
      <Card>
        {/* Search Bar */}
        <div className="p-4 border-b flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ابحث في الإعلانات..."
              className="pl-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الصورة</TableHead>
              <TableHead>العنوان والوصف</TableHead>
              <TableHead>المنتج المرتبط</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  لا توجد إعلانات حالياً
                </TableCell>
              </TableRow>
            ) : (
              filteredAds.map((ad) => (
                <TableRow key={ad.id}>
                  {/* Image */}
                  <TableCell>
                    {ad.image_url ? (
                      <div className="relative h-16 w-28 rounded-lg overflow-hidden border shadow-sm group">
                        <img
                          src={ad.image_url}
                          alt={ad.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-28 rounded-lg bg-muted flex items-center justify-center border border-dashed">
                        <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                    )}
                  </TableCell>

                  {/* Title + Description */}
                  <TableCell>
                    <div className="font-bold text-base">{ad.title}</div>
                    {ad.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
                        {ad.description}
                      </div>
                    )}
                  </TableCell>

                  {/* Linked Product */}
                  <TableCell>
                    {ad.products ? (
                      <div className="flex items-center gap-2 bg-accent/50 p-2 rounded-lg border w-fit">
                        {ad.products.image_url && (
                          <img src={ad.products.image_url} className="h-6 w-6 rounded object-cover" />
                        )}
                        <div className="text-xs font-medium">
                          {ad.products.name}
                          <div className="text-[10px] text-muted-foreground">${ad.products.price}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold",
                      ad.is_active
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                    )}>
                      {ad.is_active ? "نشط" : "مخفي"}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-accent"
                        onClick={() => handleToggleActive(ad.id, ad.is_active)}
                        title={ad.is_active ? "إخفاء الإعلان" : "تفعيل الإعلان"}
                      >
                        {ad.is_active
                          ? <EyeOff className="h-4 w-4 text-muted-foreground" />
                          : <Eye className="h-4 w-4 text-green-500" />
                        }
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-blue-50 text-blue-500"
                        onClick={() => openEditModal(ad)}
                        title="تعديل"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-destructive/10 text-destructive"
                        onClick={() => handleDelete(ad.id, ad.title)}
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAd ? "تعديل الإعلان" : "إضافة إعلان جديد"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg flex items-center gap-2 animate-in fade-in zoom-in duration-200">
              <X className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Image Preview & Upload */}
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl bg-muted/30 group relative">
              {formData.image_url ? (
                <div className="relative w-full aspect-[21/9] rounded-lg overflow-hidden border shadow-lg">
                  <img src={formData.image_url} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image_url: "" })}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full backdrop-blur-sm hover:bg-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ImageIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">صورة الإعلان</p>
                    <p className="text-xs text-muted-foreground">بقياس 1200x500 بكسل لأفضل مظهر</p>
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="ad-image-upload"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      try {
                        setSaving(true)
                        const url = await adsService.uploadImage(file)
                        setFormData({ ...formData, image_url: url })
                      } catch (err) {
                        alert("خطأ في رفع الصورة: " + err.message)
                      } finally {
                        setSaving(false)
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('ad-image-upload').click()}
                    disabled={saving}
                    className="mt-2"
                  >
                    اختر صورة
                  </Button>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">عنوان الإعلان *</label>
              <Input
                placeholder="مثال: خصومات الربيع الكبرى"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">الوصف</label>
              <textarea
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px] transition-all"
                placeholder="تفاصيل العرض..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Product Link Dropdown */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold flex items-center gap-2">
                <LinkIcon className="h-3 w-3" />
                ربط بمنتج (اختياري)
              </label>
              <select
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-10 transition-all cursor-pointer hover:border-primary/50"
                value={formData.product_id}
                onChange={e => setFormData({ ...formData, product_id: e.target.value })}
              >
                <option value="">-- اختر منتجاً للربط --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} - (${p.price})
                  </option>
                ))}
              </select>
              
              {formData.product_id && (
                <div className="mt-2 p-3 bg-primary/5 rounded-lg border border-primary/10 flex items-center justify-between animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-3">
                    {products.find(p => p.id === formData.product_id)?.image_url && (
                      <img 
                        src={products.find(p => p.id === formData.product_id)?.image_url} 
                        className="h-10 w-10 rounded object-cover border" 
                      />
                    )}
                    <div>
                      <div className="text-xs font-bold">
                        {products.find(p => p.id === formData.product_id)?.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground">المنتج المرتبط حالياً</div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setFormData({ ...formData, product_id: "" })}
                  >
                    إلغاء الربط
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
              className="flex-1 sm:flex-none"
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={saving} className="flex-1 sm:flex-none gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingAd ? "حفظ التعديلات" : "نشر الإعلان"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Ads
