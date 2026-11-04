import React, { useState, useEffect } from 'react';

export type PolicyTab = 'guide' | 'returns' | 'contact';

export interface PolicyModalProps {
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

  // Đồng bộ tab hiển thị khi người dùng bấm vào các nút khác nhau từ chân trang
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        backdropFilter: 'blur(3px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#faf8f5',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '680px',
          padding: '28px',
          position: 'relative',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          border: '1px solid #e8e6dc',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng Modal */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Đóng"
          style={{
            position: 'absolute',
            top: '18px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            lineHeight: 1,
            cursor: 'pointer',
            color: '#7f8c8d',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#df6b43')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#7f8c8d')}
        >
          &times;
        </button>

        {/* 3 Tab điều hướng */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            borderBottom: '2px solid #edebe4',
            paddingBottom: '12px',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              paddingBottom: '8px',
              fontWeight: activeTab === 'guide' ? 700 : 500,
              color: activeTab === 'guide' ? '#df6b43' : '#555',
              borderBottom: activeTab === 'guide' ? '3px solid #df6b43' : '3px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            Hướng dẫn mua hàng
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('returns')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              paddingBottom: '8px',
              fontWeight: activeTab === 'returns' ? 700 : 500,
              color: activeTab === 'returns' ? '#df6b43' : '#555',
              borderBottom: activeTab === 'returns' ? '3px solid #df6b43' : '3px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            Chính sách đổi trả
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              paddingBottom: '8px',
              fontWeight: activeTab === 'contact' ? 700 : 500,
              color: activeTab === 'contact' ? '#df6b43' : '#555',
              borderBottom: activeTab === 'contact' ? '3px solid #df6b43' : '3px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            Liên hệ
          </button>
        </div>

        {/* Nội dung chi tiết từng Tab */}
        <div
          style={{
            overflowY: 'auto',
            flex: 1,
            paddingRight: '8px',
            fontSize: '14px',
            lineHeight: '1.7',
            color: '#2f3542',
          }}
        >
          {/* 1. Hướng dẫn mua hàng */}
          {activeTab === 'guide' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '18px', color: '#1f3026', margin: '0 0 4px 0' }}>
                Quy trình đặt mua sách trực tuyến
              </h3>
              <div style={{ borderLeft: '3px solid #df6b43', paddingLeft: '12px' }}>
                <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', color: '#1f3026' }}>
                  1. Tìm kiếm và chọn sách
                </h4>
                <p style={{ margin: 0, color: '#555' }}>
                  Khám phá các tựa sách mới, sách bán chạy hoặc tìm trực tiếp qua thanh công cụ tìm kiếm. Nhấn chọn số lượng ấn phẩm bạn cần.
                </p>
              </div>

              <div style={{ borderLeft: '3px solid #df6b43', paddingLeft: '12px' }}>
                <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', color: '#1f3026' }}>
                  2. Thêm vào giỏ & Kiểm tra đơn hàng
                </h4>
                <p style={{ margin: 0, color: '#555' }}>
                  Nhấn "Mua ngay" hoặc thêm vào giỏ hàng. Mở giỏ hàng để cập nhật số lượng hoặc xóa bớt tựa sách không cần thiết trước khi đặt.
                </p>
              </div>

              <div style={{ borderLeft: '3px solid #df6b43', paddingLeft: '12px' }}>
                <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', color: '#1f3026' }}>
                  3. Điền thông tin giao nhận
                </h4>
                <p style={{ margin: 0, color: '#555' }}>
                  Điền đầy đủ họ tên, số điện thoại, chọn đúng Tỉnh/Thành, Quận/Huyện, Phường/Xã và địa chỉ số nhà chi tiết để bên vận chuyển giao tận tay bạn.
                </p>
              </div>

              <div style={{ borderLeft: '3px solid #df6b43', paddingLeft: '12px' }}>
                <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', color: '#1f3026' }}>
                  4. Chọn phương thức thanh toán
                </h4>
                <p style={{ margin: 0, color: '#555' }}>
                  Bạn có thể chọn nhận hàng trả tiền mặt (COD) hoặc quét nhanh mã VietQR để chuyển khoản an toàn. Nhấn "Xác nhận đặt hàng" để hoàn tất.
                </p>
              </div>
            </div>
          )}

          {/* 2. Chính sách đổi trả */}
          {activeTab === 'returns' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '18px', color: '#1f3026', margin: '0 0 4px 0' }}>
                Chính sách đổi trả & Hoàn tiền
              </h3>
              <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li>
                  <b>Thời gian áp dụng:</b> Hỗ trợ tiếp nhận khiếu nại và đổi trả ấn phẩm trong vòng <b>07 ngày</b> kể từ ngày nhận hàng thành công.
                </li>
                <li>
                  <b>Điều kiện sản phẩm đổi trả:</b>
                  <ul style={{ paddingLeft: '20px', marginTop: '6px' }}>
                    <li>Sách còn nguyên hiện trạng, không bị ướt, nhàu nát bìa hay gấp mép trang.</li>
                    <li>Sản phẩm gặp lỗi từ đơn vị in ấn/phát hành: rách trang, thiếu trang, in mờ, bong gáy keo.</li>
                    <li>Giao nhầm mã sách hoặc thiếu sách theo đơn đã thanh toán.</li>
                  </ul>
                </li>
                <li>
                  <b>Phí chuyển phát đổi trả:</b> Mộc Books miễn phí toàn bộ cước phí đổi trả hai chiều đối với trường hợp do lỗi từ nhà xuất bản hoặc khâu vận chuyển.
                </li>
                <li>
                  <b>Quy trình hỗ trợ:</b> Quý khách chỉ cần chụp ảnh tình trạng sách cùng hóa đơn gửi về Email hoặc Hotline/Zalo hỗ trợ của Mộc Books để được hướng dẫn đổi trả trong vòng 24 giờ.
                </li>
              </ul>
            </div>
          )}

          {/* 3. Liên hệ */}
          {activeTab === 'contact' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <h3 style={{ fontSize: '18px', color: '#1f3026', margin: 0 }}>
                Liên hệ với Mộc Books
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '20px',
                }}
              >
                {/* Thông tin cửa hàng */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                  <p style={{ margin: 0 }}>
                    <b>Địa chỉ:</b> 98 Nguyễn Hữu Quỳnh, Hiệp Hòa, Bắc Ninh[cite: 8]
                  </p>
                  <p style={{ margin: 0 }}>
                    <b>Hotline:</b> 028 7300 2486 (8h00 - 21h00 hàng ngày)[cite: 8]
                  </p>
                  <p style={{ margin: 0 }}>
                    <b>Email:</b> hello@mocbooks.vn[cite: 8]
                  </p>
                  <p style={{ margin: 0, color: '#777', fontSize: '13px' }}>
                    Chúng tôi luôn sẵn sàng lắng nghe mọi góp ý và hỗ trợ bạn tìm kiếm những ấn phẩm ưng ý nhất.
                  </p>
                </div>

                {/* Biểu mẫu liên hệ nhanh */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert('Cảm ơn bạn! Thông tin liên hệ đã được gửi thành công.');
                    onClose();
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
                >
                  <input
                    type="text"
                    placeholder="Họ và tên của bạn *"
                    required
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #dcd9cd',
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: '#fff',
                      boxSizing: 'border-box',
                    }}
                  />
                  <input
                    type="email"
                    placeholder="Địa chỉ Email *"
                    required
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #dcd9cd',
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: '#fff',
                      boxSizing: 'border-box',
                    }}
                  />
                  <textarea
                    rows={3}
                    placeholder="Nội dung cần hỗ trợ hoặc lời nhắn gửi..."
                    required
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #dcd9cd',
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: '#fff',
                      resize: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#df6b43',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    Gửi tin nhắn hỗ trợ
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