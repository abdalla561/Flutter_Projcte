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
import { categoriesService } from "../services/api"

const EMPTY_FORM = {
  name: "",
  image_url: ""
}

const PAGE_SIZE = 10

function cn(...inputs) {
  return inputs.filter(Boolean).join(" ")
}

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCategories, setTotalCategories] = useState(0)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const [data, count] = await Promise.all([
        categoriesService.getAll(currentPage, PAGE_SIZE),
        categoriesService.getCount() // Need to ensure categoriesService has getCount
      ])
      setCategories(data)
      setTotalCategories(count)
    } catch (err) {
      console.error("Error fetching categories:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [currentPage])

  const openAddModal = () => {
    setEditingCategory(null)
    setFormData(EMPTY_FORM)
    setError("")
    setIsModalOpen(true)
  }

  const openEditModal = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name || "",
      image_url: category.image_url || ""
    })
    setError("")
    setIsModalOpen(true)
  }

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await categoriesService.toggleActive(id, !currentStatus)
      setCategories(categories.map(c =>
        c.id === id ? { ...c, is_active: !currentStatus } : c
      ))
    } catch (err) {
      alert("خطأ في تغيير حالة الصنف: " + err.message)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد من حذف الصنف "${name}"؟`)) return
    try {
      await categoriesService.delete(id)
      setCategories(categories.filter(c => c.id !== id))
    } catch (err) {
      alert("خطأ في حذف الصنف: " + err.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const payload = {
        name: formData.name.trim(),
        image_url: formData.image_url.trim() || null
      }

      if (editingCategory) {
        const updated = await categoriesService.update(editingCategory.id, payload)
        setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...updated } : c))
      } else {
        const created = await categoriesService.create(payload)
        setCategories([created, ...categories])
      }
      setIsModalOpen(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const filteredCategories = categories.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">{totalCategories} صنف متاح</p>
        </div>
        <Button onClick={openAddModal} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة صنف
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ابحث باسم الصنف..."
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
              <TableHead>اسم الصنف</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  لا توجد أصناف
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        loading="lazy"
                        className="h-10 w-10 rounded-lg object-cover border"
                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                      />
                    ) : null}
                    <div
                      className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center"
                      style={{ display: category.image_url ? 'none' : 'flex' }}
                    >
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      category.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    )}>
                      {category.is_active ? "نشط" : "مخفي"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(category.id, category.is_active)}
                        title={category.is_active ? "إخفاء" : "إظهار"}
                      >
                        {category.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(category)}
                        title="تعديل"
                      >
                        <Edit2 className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(category.id, category.name)}
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
          totalItems={totalCategories}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? "تعديل الصنف" : "إضافة صنف جديد"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
              <X className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium">اسم الصنف *</label>
            <Input
              placeholder="مثال: لابتوبات"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">صورة الصنف</label>
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
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    try {
                      setSaving(true)
                      const publicUrl = await categoriesService.uploadImage(file)
                      setFormData({ ...formData, image_url: publicUrl })
                    } catch (err) {
                      alert("خطأ في رفع الصورة: " + err.message)
                    } finally {
                      setSaving(false)
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingCategory ? "حفظ التعديلات" : "إضافة الصنف"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Categories
