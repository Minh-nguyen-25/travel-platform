import React, { useState, useEffect, useCallback } from 'react';
import { destinationService } from '@/services/destination.service';
import { categoryService } from '@/services/category.service';
import type { Destination } from '@/types/destination.types';
import type { Category } from '@/types/category.types';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';

const formatCurrency = (price: number | string | undefined) => {
  const num = Number(price);
  if (isNaN(num) || num === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};

export default function DestinationsAdminPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter state
  const [search, setSearch] = useState('');
  const [filterCatId, setFilterCatId] = useState<number | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, totalPages: 1 });

  // Form Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<Destination | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phoneNumber: '',
    latitude: '',
    longitude: '',
    ticketPrice: '0',
    openingHoursNote: '',
    visitDuration: '180',
    selectedCategoryIds: [] as number[],
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [destToDelete, setDestToDelete] = useState<Destination | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Load categories
  useEffect(() => {
    categoryService.getAll().then((res) => {
      if (res.data?.success) setCategories(res.data.data);
    });
  }, []);

  // Fetch destinations
  const fetchDestinations = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await destinationService.getAll({
        page,
        limit: 8,
        search: search.trim() || undefined,
        categoryId: filterCatId,
        includeInactive: true, // Admin xem tất cả
      });

      if (res.data?.success) {
        let list = res.data.data;
        if (filterStatus === 'active') {
          list = list.filter((d) => d.isActive);
        } else if (filterStatus === 'inactive') {
          list = list.filter((d) => !d.isActive);
        }
        setDestinations(list);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách địa điểm:', err);
      showToast('error', 'Không thể tải danh sách địa điểm');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, filterCatId, filterStatus]);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  // Handle toggle status (Ẩn / Hiện địa điểm)
  const handleToggleStatus = async (dest: Destination) => {
    try {
      const nextStatus = !dest.isActive;
      const res = await destinationService.toggleStatus(dest.id, nextStatus);
      if (res.data?.success) {
        showToast('success', nextStatus ? `Đã hiển thị "${dest.name}"` : `Đã ẩn "${dest.name}"`);
        fetchDestinations();
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingDest(null);
    setFormData({
      name: '',
      description: '',
      address: '',
      phoneNumber: '',
      latitude: '21.0285',
      longitude: '105.8542',
      ticketPrice: '0',
      openingHoursNote: 'Mở cửa hàng ngày',
      visitDuration: '180',
      selectedCategoryIds: categories.length > 0 ? [categories[0].id] : [],
    });
    setSelectedFiles([]);
    setFilePreviews([]);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (dest: Destination) => {
    setEditingDest(dest);
    const catIds = dest.categories?.map((c) => c.category?.id || (c as any).categoryId).filter(Boolean) || [];
    setFormData({
      name: dest.name,
      description: dest.description || '',
      address: dest.address,
      phoneNumber: dest.phoneNumber || '',
      latitude: String(dest.latitude),
      longitude: String(dest.longitude),
      ticketPrice: String(dest.ticketPrice),
      openingHoursNote: dest.openingHoursNote || '',
      visitDuration: dest.visitDuration ? String(dest.visitDuration) : '180',
      selectedCategoryIds: catIds,
    });
    setSelectedFiles([]);
    setFilePreviews([]);
    setIsFormModalOpen(true);
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
      const previews = filesArray.map((f) => URL.createObjectURL(f));
      setFilePreviews(previews);
    }
  };

  // Handle category checkbox toggle
  const handleCategoryToggle = (id: number) => {
    setFormData((prev) => {
      const exists = prev.selectedCategoryIds.includes(id);
      const updated = exists
        ? prev.selectedCategoryIds.filter((cid) => cid !== id)
        : [...prev.selectedCategoryIds, id];
      return { ...prev, selectedCategoryIds: updated };
    });
  };

  // Handle form submit (Create or Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('error', 'Tên địa điểm không được để trống');
      return;
    }
    if (!formData.address.trim()) {
      showToast('error', 'Địa chỉ không được để trống');
      return;
    }
    if (formData.selectedCategoryIds.length === 0) {
      showToast('error', 'Cần chọn ít nhất 1 danh mục du lịch');
      return;
    }

    try {
      setIsSubmitting(true);
      const body = new FormData();
      body.append('name', formData.name.trim());
      body.append('address', formData.address.trim());
      body.append('description', formData.description.trim());
      body.append('phoneNumber', formData.phoneNumber.trim());
      body.append('latitude', formData.latitude);
      body.append('longitude', formData.longitude);
      body.append('ticketPrice', formData.ticketPrice);
      body.append('openingHoursNote', formData.openingHoursNote.trim());
      body.append('visitDuration', formData.visitDuration);
      body.append('categoryIds', JSON.stringify(formData.selectedCategoryIds));

      // Append files
      selectedFiles.forEach((file) => {
        body.append('images', file);
      });

      if (editingDest) {
        const res = await destinationService.update(editingDest.id, body);
        if (res.data?.success) {
          showToast('success', 'Cập nhật địa điểm thành công');
        }
      } else {
        const res = await destinationService.create(body);
        if (res.data?.success) {
          showToast('success', 'Tạo mới địa điểm thành công');
        }
      }

      setIsFormModalOpen(false);
      fetchDestinations();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu địa điểm';
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleOpenDelete = (dest: Destination) => {
    setDestToDelete(dest);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!destToDelete) return;
    try {
      setIsDeleting(true);
      const res = await destinationService.delete(destToDelete.id);
      if (res.data?.success) {
        showToast('success', `Đã ẩn địa điểm "${destToDelete.name}" thành công`);
        setDeleteModalOpen(false);
        fetchDestinations();
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Không thể ẩn địa điểm này');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transition-all ${
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          <span>{toast.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header trang */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Địa Điểm</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý các điểm đến du lịch, thông tin tọa độ, giá vé, hình ảnh và trạng thái hiển thị
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Thêm địa điểm mới
        </Button>
      </div>

      {/* Bộ lọc nhanh phía trên bảng */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
          {/* Tìm kiếm tên */}
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm kiếm theo tên địa điểm..."
              className="w-full text-xs sm:text-sm border border-gray-200 rounded-xl px-3.5 py-2 pl-9 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Lọc danh mục */}
          <select
            value={filterCatId || ''}
            onChange={(e) => {
              setFilterCatId(e.target.value ? Number(e.target.value) : undefined);
              setPage(1);
            }}
            className="text-xs sm:text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Lọc trạng thái (Tất cả / Đang hiện / Đã ẩn) */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl self-start md:self-auto">
          {(['all', 'active', 'inactive'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setFilterStatus(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === st
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {st === 'all' ? 'Tất cả' : st === 'active' ? 'Đang hiện' : 'Đã ẩn'}
            </button>
          ))}
        </div>
      </div>

      {/* Bảng danh sách địa điểm */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20">
            <Loading message="Đang tải danh sách địa điểm..." />
          </div>
        ) : destinations.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg font-semibold mb-2">Không tìm thấy địa điểm nào</p>
            <p className="text-sm mb-4">Hãy thử thay đổi điều kiện tìm kiếm hoặc thêm địa điểm mới</p>
            <Button onClick={handleOpenCreate}>Thêm địa điểm ngay</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/75 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Địa điểm</th>
                  <th className="px-6 py-4">Danh mục</th>
                  <th className="px-6 py-4">Giá vé</th>
                  <th className="px-6 py-4">Đánh giá</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {destinations.map((dest) => {
                  const primaryImg =
                    dest.images?.find((img) => img.isPrimary)?.imageUrl ||
                    dest.images?.[0]?.imageUrl ||
                    'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=100&auto=format&fit=crop';
                  return (
                    <tr key={dest.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Ảnh & Tên */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={primaryImg}
                            alt={dest.name}
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=100&auto=format&fit=crop';
                            }}
                            className="w-12 h-12 rounded-xl object-cover bg-gray-100 border border-gray-200 flex-shrink-0"
                          />
                          <div>
                            <p className="font-bold text-gray-900 hover:text-primary-600 transition">
                              {dest.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-xs">{dest.address}</p>
                          </div>
                        </div>
                      </td>

                      {/* Danh mục */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {dest.categories?.map((c, i) => (
                            <span
                              key={i}
                              className="text-[11px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md"
                            >
                              {c.category?.name}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Giá vé */}
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {formatCurrency(dest.ticketPrice)}
                      </td>

                      {/* Rating */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 font-bold text-xs bg-yellow-50 text-yellow-800 px-2 py-0.5 rounded-md border border-yellow-200">
                          <span className="text-yellow-500">★</span>
                          <span>{Number(dest.rating).toFixed(1)}</span>
                        </span>
                      </td>

                      {/* Trạng thái Ẩn / Hiện */}
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(dest)}
                          title="Bấm để chuyển đổi Ẩn/Hiện"
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
                            dest.isActive
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              dest.isActive ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          ></span>
                          <span>{dest.isActive ? 'Đang hiện' : 'Đã ẩn'}</span>
                        </button>
                      </td>

                      {/* Thao tác */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(dest)}
                            className="px-3 py-1.5 text-xs font-semibold text-primary-600 hover:bg-primary-50 rounded-lg transition"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleOpenDelete(dest)}
                            className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Phân trang */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Trang {pagination.page} / {pagination.totalPages} (Tổng {pagination.total} địa điểm)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 border border-gray-200 rounded-lg text-xs font-semibold disabled:opacity-40"
              >
                Trước
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border border-gray-200 rounded-lg text-xs font-semibold disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODAL THÊM / SỬA ĐỊA ĐIỂM (FORM) ────────────────────────── */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => !isSubmitting && setIsFormModalOpen(false)}
        title={editingDest ? `Chỉnh sửa địa điểm: ${editingDest.name}` : 'Thêm Địa Điểm Du Lịch Mới'}
        size="xl"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 max-h-[75vh] overflow-y-auto px-1 pr-2">
          {/* Tên */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Tên địa điểm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Vịnh Hạ Long, Phố cổ Hội An..."
              required
              className="w-full text-sm border border-gray-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          {/* Danh mục (Multi-select) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Danh mục du lịch <span className="text-red-500">* (Chọn ít nhất 1)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 max-h-40 overflow-y-auto">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.selectedCategoryIds.includes(cat.id)}
                    onChange={() => handleCategoryToggle(cat.id)}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Địa chỉ */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Địa chỉ chi tiết <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="VD: Thành phố Hạ Long, Quảng Ninh"
              required
              className="w-full text-sm border border-gray-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          {/* Tọa độ Latitude / Longitude */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Vĩ độ (Latitude) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="VD: 20.9101"
                required
                className="w-full text-sm border border-gray-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Kinh độ (Longitude) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="VD: 107.1839"
                required
                className="w-full text-sm border border-gray-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Giá vé & Thời lượng */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Giá vé (VNĐ, 0 = Miễn phí)
              </label>
              <input
                type="number"
                min="0"
                value={formData.ticketPrice}
                onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                placeholder="VD: 250000"
                className="w-full text-sm border border-gray-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Thời lượng (phút)
              </label>
              <input
                type="number"
                min="1"
                value={formData.visitDuration}
                onChange={(e) => setFormData({ ...formData, visitDuration: e.target.value })}
                placeholder="VD: 180"
                className="w-full text-sm border border-gray-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Số điện thoại
              </label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="VD: 02033846564"
                className="w-full text-sm border border-gray-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Giờ mở cửa */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Giờ mở cửa / Ghi chú
            </label>
            <input
              type="text"
              value={formData.openingHoursNote}
              onChange={(e) => setFormData({ ...formData, openingHoursNote: e.target.value })}
              placeholder="VD: Mở cửa hàng ngày từ 07:00 đến 17:30"
              className="w-full text-sm border border-gray-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          {/* Mô tả chi tiết */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Bài viết giới thiệu chi tiết
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả danh lam thắng cảnh, điểm đặc sắc, trải nghiệm nổi bật..."
              className="w-full text-sm border border-gray-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
            />
          </div>

          {/* Upload ảnh mới */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              {editingDest ? 'Tải thêm ảnh mới từ máy tính' : 'Hình ảnh địa điểm (Tải ảnh từ máy tính)'}
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
            />
            {filePreviews.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-primary-700 mb-1.5 font-semibold">
                  Ảnh mới đã chọn ({filePreviews.length} ảnh):
                </p>
                <div className="flex items-center gap-2 overflow-x-auto p-2 bg-primary-50/50 rounded-xl border border-primary-200">
                  {filePreviews.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`prev-${i}`}
                      className="w-16 h-16 object-cover rounded-lg border border-primary-300 shadow-sm flex-shrink-0"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Nút hành động */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsFormModalOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingDest ? 'Lưu cập nhật' : 'Tạo địa điểm'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL XÁC NHẬN XÓA ────────────────────────────────────── */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !isDeleting && setDeleteModalOpen(false)}
        title="Xác nhận ẩn địa điểm"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Bạn có chắc chắn muốn ẩn địa điểm{' '}
            <span className="font-bold text-gray-900">"{destToDelete?.name}"</span> khỏi danh sách hiển thị cho người dùng không?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button variant="danger" isLoading={isDeleting} onClick={handleConfirmDelete}>
              Xác nhận ẩn
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
