import React, { useState, useEffect } from "react"
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Loader2,
  ImageIcon,
  X
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
import { Pagination } from "../components/ui/Pagination"
import { productsService, categoriesService } from "../services/api"

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  ram: "",
  storage: "",
  type: "",
  image_url: "",
  category_id: ""
}

const PAGE_SIZE = 10

const PRODUCT_TYPES = ["Laptop", "Mobile", "Tablet", "TV", "Headphones", "Watch", "Drone", "Accessory", "Gaming", "Other"]

function cn(...inputs) {
  return inputs.filter(Boolean).join(" ")
}

const Products = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [productsData, categoriesData, count] = await Promise.all([
        productsService.getAll(currentPage, PAGE_SIZE),
        categoriesService.getAll(1, 100), // Get all categories for select
        productsService.getCount()
      ])
      setProducts(productsData)
      setCategories(categoriesData)
      setTotalProducts(count)
    } catch (err) {
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentPage])

  const openAddModal = () => {
    setEditingProduct(null)
    setFormData(EMPTY_FORM)
    setError("")
    setIsModalOpen(true)
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      ram: product.ram || "",
      storage: product.storage || "",
      type: product.type || "",
      image_url: product.image_url || "",
      category_id: product.category_id || ""
    })
    setError("")
    setIsModalOpen(true)
  }

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await productsService.toggleActive(id, !currentStatus)
      setProducts(products.map(p =>
        p.id === id ? { ...p, is_active: !currentStatus } : p
      ))
    } catch (err) {
      alert("خطأ في تغيير حالة المنتج: " + err.message)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد من حذف المنتج "${name}"؟`)) return
    try {
      await productsService.delete(id)
      setProducts(products.filter(p => p.id !== id))
      setTotalProducts(prev => prev - 1)
    } catch (err) {
      alert("خطأ في حذف المنتج: " + err.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        ram: formData.ram.trim() || null,
        storage: formData.storage.trim() || null,
        type: formData.type || null,
        image_url: formData.image_url.trim() || null,
        category_id: formData.category_id || null
      }

      if (editingProduct) {
        const updated = await productsService.update(editingProduct.id, payload)
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...updated } : p))
      } else {
        const created = await productsService.create(payload)
        setProducts([created, ...products.slice(0, PAGE_SIZE - 1)])
        setTotalProducts(prev => prev + 1)
      }
      setIsModalOpen(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.type?.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">{totalProducts} منتج في المخزن</p>
        </div>
        <Button onClick={openAddModal} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة منتج
        </Button>
      </div>

      {/* Table Card */}
      <Card>
        {/* Search Bar */}
        <div className="p-4 border-b flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ابحث باسم المنتج أو النوع..."
              className="pl-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {filteredProducts.length} نتيجة في هذه الصفحة
            </span>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الصورة</TableHead>
              <TableHead>اسم المنتج</TableHead>
              <TableHead>الصنف</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>RAM</TableHead>
              <TableHead>التخزين</TableHead>
              <TableHead>السعر</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                  لا توجد منتجات
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  {/* Image */}
                  <TableCell>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        loading="lazy"
                        className="h-10 w-10 rounded-lg object-cover border"
                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                      />
                    ) : null}
                    <div
                      className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center"
                      style={{ display: product.image_url ? 'none' : 'flex' }}
                    >
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </TableCell>

                  {/* Name + description */}
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    {product.description && (
                      <div className="text-xs text-muted-foreground truncate max-w-[160px]">
                        {product.description}
                      </div>
                    )}
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    {product.category_id ? (
                      <span className="text-sm font-medium">
                        {categories.find(c => c.id === product.category_id)?.name || "صنف غير معروف"}
                      </span>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>

                  <TableCell>
                    {product.type ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {product.type}
                      </span>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>

                  <TableCell className="text-sm">
                    {product.ram || <span className="text-muted-foreground">—</span>}
                  </TableCell>

                  <TableCell className="text-sm">
                    {product.storage || <span className="text-muted-foreground">—</span>}
                  </TableCell>

                  <TableCell className="font-semibold">
                    ${Number(product.price).toLocaleString()}
                  </TableCell>

                  <TableCell>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      product.is_active
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                    )}>
                      {product.is_active ? "نشط" : "مخفي"}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {/* Toggle active */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(product.id, product.is_active)}
                        title={product.is_active ? "إخفاء المنتج" : "إظهار المنتج"}
                      >
                        {product.is_active
                          ? <EyeOff className="h-4 w-4 text-muted-foreground" />
                          : <Eye className="h-4 w-4 text-green-500" />
                        }
                      </Button>
                      {/* Edit */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(product)}
                        title="تعديل"
                      >
                        <Edit2 className="h-4 w-4 text-blue-500" />
                      </Button>
                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product.id, product.name)}
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <Pagination 
          currentPage={currentPage}
          totalItems={totalProducts}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
              <X className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium">اسم المنتج *</label>
              <Input
                placeholder="مثال: Samsung Galaxy S25"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium">الوصف</label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px] resize-none"
                placeholder="وصف مختصر للمنتج..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Price */}
            <div className="space-y-1">
              <label className="text-sm font-medium">السعر ($) *</label>
              <Input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-sm font-medium">الصنف</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-10"
                value={formData.category_id}
                onChange={e => setFormData({ ...formData, category_id: e.target.value })}
              >
                <option value="">اختر الصنف...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div className="space-y-1">
              <label className="text-sm font-medium">النوع</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-10"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="">اختر النوع...</option>
                {PRODUCT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* RAM */}
            <div className="space-y-1">
              <label className="text-sm font-medium">RAM</label>
              <Input
                placeholder="مثال: 16GB"
                value={formData.ram}
                onChange={e => setFormData({ ...formData, ram: e.target.value })}
              />
            </div>

            {/* Storage */}
            <div className="space-y-1">
              <label className="text-sm font-medium">التخزين</label>
              <Input
                placeholder="مثال: 512GB"
                value={formData.storage}
                onChange={e => setFormData({ ...formData, storage: e.target.value })}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium">صورة المنتج</label>
              <div className="flex items-center gap-4">
                <div className="relative group">
                  {formData.image_url ? (
                    <div className="relative">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="h-24 w-24 rounded-lg object-cover border shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: "" })}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      
                      try {
                        setSaving(true)
                        const publicUrl = await productsService.uploadImage(file)
                        setFormData({ ...formData, image_url: publicUrl })
                      } catch (err) {
                        alert("خطأ في رفع الصورة: " + err.message)
                      } finally {
                        setSaving(false)
                      }
                    }}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    اختر صورة من جهازك (JPG, PNG, WebP)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingProduct ? "حفظ التعديلات" : "إضافة المنتج"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Products
