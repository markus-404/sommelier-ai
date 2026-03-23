# Hướng dẫn Thiết lập Dify.ai cho AI Sommelier Nhà Chát

Hồ sơ này hướng dẫn bạn cách import và cấu hình toàn bộ hệ thống lên nền tảng **Dify.ai** để AI có thể tự động lấy sản phẩm từ website của bạn và chốt đơn cho khách.

## Bước 1: Tạo Ứng dụng trên Dify (Create Application)
1. Đăng nhập vào [Dify.ai](https://dify.ai).
2. Chọn **Studio** -> **Create from Blank** -> Chọn **Agent** (để AI có thể dùng công cụ).
3. Đặt tên ứng dụng là: `Nha Chat AI Sommelier`.
4. Nhấn **Create**.

## Bước 2: Cấu hình System Prompt (Instructions)
1. Mở file `Dify_System_Prompt.md` (tôi vừa tạo).
2. Copy toàn bộ nội dung trong file đó.
3. Paste vào ô **Instructions** bên góc trái của giao diện Agent trên Dify.
4. Kéo xuống dưới, bật tính năng **Conversation Variables** nếu bạn muốn tracking thông tin khách hàng (như Tên, Tuổi 18+).

## Bước 3: Cấu hình Tools (Tích hợp Website bán hàng)
Đây là phần cốt lõi để AI Sommelier có thể "Giao dịch theo yêu cầu và cung cấp sản phẩm thực tế".

1. Trên menu chính của Dify, chọn mục **Tools** (biểu tượng cờ lê ở thanh menu ngang phía trên).
2. Nhấn vào **Create Custom Tool** ở góc phải.
3. Đặt tên Provider: `NhaChat Store API`.
4. Bạn sẽ thấy ô nhập **OpenAPI Schema**. 
5. Mở file `Dify_NhaChat_Tools.yaml` (tôi vừa tạo) bằng Notepad hoặc VS Code. Copy toàn bộ nội dung.
6. Paste toàn bộ mã YAML đó vào ô Schema của Dify. Dify sẽ tự động nhận diện 2 công cụ là:
   - `search_nhachat_wines`
   - `create_nhachat_checkout`
7. (Quan trọng): Chỉnh sửa phần Authen. Tại phần **Authentication**, thiết lập API Key của website nhà chát (nếu Website của bạn yêu cầu Authorization Header để gọi API).
8. Lưu lại (Save).

## Bước 4: Thêm Tools vào Agent
1. Quay lại ứng dụng Agent bạn tạo ở Bước 1.
2. Tại phần **Tools** (dưới ô Instructions), nhấn nút **Add**.
3. Tìm đến Tool `NhaChat Store API` vừa tạo, và add cả 2 công cụ: `search_nhachat_wines` và `create_nhachat_checkout`.
4. Ở phần "Model", chọn một model tư duy tốt, ví dụ: `Claude-3.5-Sonnet` hoặc `GPT-4o` vì việc sử dụng Tools đòi hỏi tư duy logic cao (để tính 18+, gợi ý vang, v.v.).

## Bước 5: Cấu hình Knowledge Base (Tùy chọn)
Nếu bạn có một tài liệu nội bộ về Tasting Notes của tất cả các dòng rượu vang, hoặc file `Kich_ban_AI_Sommelier_V2.xlsx` vừa làm:
1. Vào tab **Knowledge**.
2. Upload file Excel hoặc PDF tài liệu.
3. Gắn Knowledge base đó vào mục **Context** của Agent. Điều này sẽ giúp AI có thêm kiến thức chuyên sâu về sản phẩm nội bộ nếu Tool API trả về thiếu mô tả.

## Bước 6: Publish & Gắn vào Website
1. Ở góc trên bên phải màn hình Dify, nhấn **Publish** -> **Update**.
2. Chọn **Overview**, bạn sẽ thấy phần **Embedded**.
3. Copy đoạn mã `<script>` do Dify cung cấp và dán vào phần `<head>` hoặc `<body>` trong source code của Website (ví dụ Nhachat.com) để hiển thị bong bóng Chatbot!

## ĐẶC BIỆT: Hướng Dẫn Cập Nhật Kịch Bản (Excel V2) Sau Này
Bạn yêu cầu cấu hình sao cho file Excel `Kich_ban_AI_Sommelier_V2.xlsx` có thể điều chỉnh và cập nhật lại sau này. Dify cung cấp 2 phương án cực kỳ dễ dàng:

### Phương án 1 (Trực tiếp bằng File):
1. Bất cứ khi nào bạn edit thêm Tasting notes hay Food Pairing vào file Excel trên máy tính của bạn, hãy lưu (Save) lại.
2. Vào ứng dụng Dify -> tab **Knowledge** -> click vào Tài liệu Excel cũ.
3. Chọn **Settings** (biểu tượng bánh răng) hoặc bấm thẳng vào nút **Synchronize / Cập nhật file**.
4. Tải file vừa chỉnh sửa lên đè vào là xong. Hệ thống Vector DB của Dify sẽ tự học lại các dòng mới bạn nhập!

### Phương án 2 (Đồng bộ Google Notion / Google Drive - Khuyên Dùng):
Thay vì quản lý file Excel offline:
1. Bạn import file Excel này lên **Notion** hoặc **Google Drive** dưới dạng Bảng.
2. Lúc tạo Knowledge trên Dify ban đầu (Bước 5), bạn không chọn "Upload text file" mà hãy chọn **Sync from Notion** (hoặc Web/Google Drive).
3. Mọi dữ liệu bạn hoặc team Update trên Notion/Google Sheets sẽ được Dify "tự động" quét và cập nhật hàng ngày (hoặc bấm nút Sync thủ công cho nhanh) mà không cần phải tải lên lại!

