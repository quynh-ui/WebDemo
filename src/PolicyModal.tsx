import React, { useState } from 'react';

export type PolicyTab = 'guide' | 'returns' | 'contact';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: PolicyTab;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'guide',
}) => {
  const [activeTab, setActiveTab] = useState<PolicyTab>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-xl bg-[#faf8f5] p-6 shadow-xl">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-gray-800"
        >
          &times;
        </button>

        {/* 3 Tab điều hướng */}
        <div className="flex border-b border-gray-200 pb-3 gap-6 mb-6">
          <button
            onClick={() => setActiveTab('guide')}
            className={`text-lg font-medium transition-colors ${
              activeTab === 'guide'
                ? 'text-[#e77f67] font-semibold border-b-2 border-[#e77f67] pb-1'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Hướng dẫn mua hàng
          </button>

          <button
            onClick={() => setActiveTab('returns')}
            className={`text-lg font-medium transition-colors ${
              activeTab === 'returns'
                ? 'text-[#e77f67] font-semibold border-b-2 border-[#e77f67] pb-1'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Chính sách đổi trả
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`text-lg font-medium transition-colors ${
              activeTab === 'contact'
                ? 'text-[#e77f67] font-semibold border-b-2 border-[#e77f67] pb-1'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Liên hệ
          </button>
        </div>

        {/* Nội dung chi tiết */}
        <div className="max-h-[65vh] overflow-y-auto pr-2 text-gray-700">
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">Quy trình đặt mua hàng</h3>
              <div className="space-y-3">
                <div className="border-l-4 border-[#e77f67] pl-3">
                  <h4 className="font-semibold text-gray-900">1. Chọn sản phẩm</h4>
                  <p className="text-sm">Tìm kiếm và chọn kích cỡ, màu sắc phù hợp trước khi nhấn mua.</p>
                </div>
                <div className="border-l-4 border-[#e77f67] pl-3">
                  <h4 className="font-semibold text-gray-900">2. Đặt hàng & Nhập địa chỉ</h4>
                  <p className="text-sm">Vào giỏ hàng, điền đầy đủ địa chỉ giao hàng cùng số điện thoại nhận hàng.</p>
                </div>
                <div className="border-l-4 border-[#e77f67] pl-3">
                  <h4 className="font-semibold text-gray-900">3. Xác nhận thanh toán</h4>
                  <p className="text-sm">Chọn phương thức COD hoặc chuyển khoản để hoàn tất đơn đặt.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'returns' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">Chính sách áp dụng đổi trả</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
                <li><strong>Thời hạn đổi trả:</strong> Trong vòng 07 ngày kể từ ngày nhận hàng thành công.</li>
                <li><strong>Điều kiện:</strong> Sản phẩm còn nguyên tag mác, chưa qua sử dụng hoặc giặt tẩy.</li>
                <li><strong>Đổi trả do lỗi:</strong> Miễn phí vận chuyển 2 chiều nếu phát sinh lỗi từ nhà sản xuất.</li>
              </ul>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">Thông tin liên hệ & Hỗ trợ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 text-sm">
                  <p><strong>Hotline:</strong> 0123 456 789 (8h00 - 21h00)</p>
                  <p><strong>Email:</strong> support@webdemo.vn</p>
                  <p><strong>Địa chỉ:</strong> Hà Nội, Việt Nam</p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert('Yêu cầu hỗ trợ đã được gửi thành công!');
                    onClose();
                  }}
                  className="space-y-2"
                >
                  <input
                    type="text"
                    placeholder="Họ và tên"
                    required
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                  <textarea
                    rows={3}
                    placeholder="Nội dung cần hỗ trợ..."
                    required
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="w-full rounded bg-[#e77f67] py-2 text-sm font-semibold text-white hover:opacity-90"
                  >
                    Gửi tin nhắn
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};