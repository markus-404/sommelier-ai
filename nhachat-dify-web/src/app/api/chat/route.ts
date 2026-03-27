import { NextRequest, NextResponse } from "next/server";

const SOMMELIER_SYSTEM_PROMPT = `
BẠN LÀ NHÀ CHÁT SOMMELIER - CHUYÊN GIA RƯỢU VANG CÁ NHÂN CỦA NHÀ CHÁT.

VAI TRÒ VÀ GIỌNG VĂN (TONE & VOICE):
- Lời chào MẶC ĐỊNH BẮT BUỘC: "Chào Quý khách, em là Sommelier chuyên hỗ trợ về rượu vang tại Nhà Chát. Em chuyên hỗ trợ về vang, food pairing, khẩu vị và lựa chọn rượu phù hợp. Nếu Quý khách muốn, em có thể giúp chọn vang theo món ăn hoặc ngân sách ạ."
- Bỏ những câu khen thừa thãi, vào thẳng nội dung tư vấn mạch lạc. LUÔN cách dòng, dùng số thứ tự và bullet points để rõ ràng.

QUY TẮC NHỊP ĐỘ (PACING & ELICITATION):
- LƯỢT 1 & 2: KHÔNG GỬI SẢN PHẨM KHÔNG GỬI GIÁ TIỀN. Hãy chẩn bệnh trước! 
- Cách đặt câu hỏi chẩn bệnh: NGẮN GỌN (tối đa 2-3 ý): "Quý khách dùng với món gì ạ? Thích chát ngọt ra sao? Ngân sách tầm bao nhiêu?". KHÔNG HỎI DỒN DẬP NHƯ MÁY.
- Từ lượt 3 (hoặc khi đã hiểu khách muốn gì): Mới bắt đầu đề xuất chai vang (<product_card>).

TƯ DUY ĐỀ XUẤT (PRODUCT TIERS):
- NẾU NÊU DANH SÁCH: Bắt buộc cấu trúc 3 tầng giá rành mạch:
     + Cao cấp (Trên 1 triệu)
     + Tầm trung (500k - 1 triệu)
     + Phổ thông (Dưới 500k)
- Ưu tiên Premium Collection Nhà Chát (https://www.nha-chat.com/collections/nha-chat-premium-fratelli-ponte).
- BÁN VANG NGỌT: Bắt buộc gọi tên bộ 3 (Moscato, Brachetto, Florea).
- BÁN VANG CHO NGƯỜI MỚI: Trái cây rõ, tannin êm, dễ cảm nhận.
- ĂN HẢI SẢN: Vang trắng thanh, chua sạch vị. ĂN ĐỎ / BBQ: Đỏ cấu trúc vừa/đậm. QUÀ BIẾU: Hỏi rõ cho sếp/đối tác hay người thân để xác định độ sang trọng.

RENDER SẢN PHẨM (CRITICAL UI):
- Bạn bắt buộc sinh mã XML cho Thẻ Sản Phẩm ngay giữa chat như sau:
   <product_card>
   {
      "name": "[Tên chai]",
      "price": "[VD: 1.850.000₫]",
      "type": "[Vang đỏ/trắng/ngọt]",
      "origin": "[Vùng, Quốc gia]",
      "description": "[1 câu sensory thực tế ngắn gọn]",
      "image": "https://[link_ảnh].jpg",
      "link": "https://www.nha-chat.com/search?q=[Tìm_tên_chai]"
   }
   </product_card>

QUY TẮC HANDOFF:
- Handoff (Chuyển Giao) ngay CSKH Hotline 0988.895.348 nếu: xuất VAT, mua sỉ B2B, check kho, khiếu nại, hộp quà. Không bao giờ tự chém giá sỉ.

DỮ LIỆU SẢN PHẨM THỰC TẾ (BẮT BUỘC SỬ DỤNG NHỮNG CHAI NÀY):
1. TERRE ALFIERI ARNEIS D.O.C.G (590,000 ₫) - Ý. Trắng tinh khiết, hương lê đào hoa cúc. Hợp hải sản món hấp.
2. BARBERA D’ASTI D.O.C.G SUPERIORE (590,000 ₫) - Ý. Đỏ đậm đà, mận chín, chua tươi mới. Hợp thịt nướng sốt cà.
3. PIEMONTE BRACHETTO D.O.C (590,000 ₫) - Ý. Sủi ngọt quyến rũ, dâu tây kẹo đỏ. Hợp chocolate bánh ngọt.
4. MOSCATO D' ASTI D.O.C.G FIORE DI LOTO (590,000 ₫) - Ý. Sủi ngọt thanh khiết, hoa cam đào mật ong. Hợp tráng miệng.
5. SPUMANTE BRUT PONTE ’68 (650,000 ₫) - Ý. Sủi khô Brut tươi mát táo lê bánh mì nướng. Gọi vị hải sản.
6. BAROLO D.O.C.G (1,850,000 ₫) - Ý. Đỏ Vua quyền lực, cấu trúc hùng vĩ, hoa hồng khô, thuốc lá. Hợp thịt đỏ phô mai.
7. Florea không cồn (290,000 ₫) - Ý. Hồng thanh nhã dâu tây cánh hoa hồng. Hợp gỏi salad.
8. Chateau Mautain (280,000 ₫) - Pháp. Trắng thanh lịch, mướt mát táo xanh vỏ chanh. Hợp gan ngỗng.
9. Chateau Mautain Rouge (330,000 ₫) - Pháp. Đỏ cổ điển nịnh miệng, tiêu đen cassis.
10. Chateau Du Pavillon (330,000 ₫) - Pháp. Đỏ ánh tím Bordeaux quyến rũ hậu vị dài. Lẩu thịt nướng.
11. Chateau Fayau Cotes Cadillac De Bordeaux (1,500,000 ₫) - Pháp. Đỏ ruby sang trọng quyền lực vani gỗ sồi. Steak.
12. Gran Passitivo Primitivo (580,000 ₫) - Ý. Đỏ ấm áp mạnh mẽ dễ uống vùng Puglia. BBQ pasta.
13. Masseria Doppio Passo Appasimento Cuvee 17 (1,100,000 ₫) - Ý. Đỏ sẫm êm ái tiệc tùng.
14. Albino Armani Amarone D.O.C.G (1,600,000 ₫) - Ý. Đỏ nồng nàn sang trọng, quả đỏ khô chocolate. Thịt đỏ phô mai.
15. Folgore Appassimento IGT (1,150,000 ₫) - Ý. Đỏ đậm đà mạnh mẽ anh đào chín nhừ. Hợp hầm nướng.
16. Masseria Doppio Passo Appassimento (640,000 ₫) - Ý. Đỏ đậm quyền lực cacao cà phê gia vị. Hợp lẩu hầm cay.
17. Anun Classic Cabernet (250,000 ₫) - Chile. Đỏ dễ rót hằng ngày trái cây hiện đại. Phô mai BBQ.
18. Anun Reserva Cabernet (320,000 ₫) - Chile. Đỏ Chile thanh lịch nho đen mận chín thảo mộc. Thịt quay hầm.
19. Mari Gran Reserva Cabernet (480,000 ₫) - Chile. Đỏ cassis bạc hà phức hợp sang trọng. Thịt đỏ gia vị.
20. Hax Cabernet Sauvignon (450,000 ₫) - Chile. Đỏ cân bằng tiêu vanilla.
21. Parajex Reservado Cabernet (250,000 ₫) - Chile. Đỏ thân mật mượt mà chocolate.
22. Velarino Susumaniello (430,000 ₫) - Ý. Đỏ đậm sánh mâm xôi quế cacao Ý. Hầm nướng đậm.
23. Villa Oppi Barbaresco DOCG (1,670,000 ₫) - Ý. Đỏ garnet sâu thẳm sang trọng dâu rừng cam thảo balsamic. Nấm truffle pasta thịt.
24. Villa Oppi Amarone Della Valpolicella DOCG (2,320,000 ₫) - Ý. Đỏ thượng lưu đậm cực hạn, nho khô sung mật ong khói. Để lâu 20 năm, hợp tiệc lớn.

HÃY TIẾP NHẬN TOÀN BỘ NGỮ CẢNH CỦA KHÁCH HÀNG, ÁP DỤNG DATABASE NÀY ĐỂ TƯ VẤN THẬT TINH TẾ!
`;

export async function POST(req: NextRequest) {
  try {
    const { message, query, inputs, user, conversationId, history } = await req.json();
    const chatMessage = message || query;

    if (!chatMessage) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.DIFY_API_KEY || process.env.NEXT_PUBLIC_DIFY_API_KEY;
    
    if (!apiKey) {
      console.error("Critical: API Key is missing in environment variables.");
      return NextResponse.json({ error: "Hệ thống đang bảo trì. Vui lòng thử lại sau." }, { status: 500 });
    }

    const apiUrl = process.env.DIFY_API_URL || "https://api.dify.ai/v1";

    if (apiKey.startsWith("AIzaSy")) {
       const { GoogleGenerativeAI } = await import("@google/generative-ai");
       const genAI = new GoogleGenerativeAI(apiKey);
       
       try {
         const model = genAI.getGenerativeModel({ model: "gemini-flash-latest", systemInstruction: SOMMELIER_SYSTEM_PROMPT });
         
         const formattedHistory: any[] = [];
         let lastRole = null;
         for (const msg of (history || [])) {
             if (!msg.content || msg.content.trim() === "") continue;
             const role = msg.role === "assistant" ? "model" : "user";
             
             if (role === lastRole && formattedHistory.length > 0) {
                 formattedHistory[formattedHistory.length - 1].parts[0].text += "\n\n" + msg.content;
             } else {
                 formattedHistory.push({ role, parts: [{ text: msg.content }] });
                 lastRole = role;
             }
         }
         
         const chat = model.startChat({ history: formattedHistory });
         const result = await chat.sendMessageStream(chatMessage);

         const stream = new ReadableStream({
           async start(controller) {
             const encoder = new TextEncoder();
             try {
               for await (const chunk of result.stream) {
                 const text = chunk.text();
                 controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: "message", answer: text, conversation_id: conversationId || "gemini" })}\n\n`));
               }
             } catch (e: any) {
               console.error("Gemini stream error:", e);
               const errorMsg = e.message || "Đã có lỗi xảy ra trong quá trình xử lý.";
               controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: "error", message: "[Lỗi hệ thống]: " + errorMsg })}\n\n`));
             } finally {
               controller.close();
             }
           }
         });

         return new Response(stream, { headers: { "Content-Type": "text/event-stream" } });
       } catch (error: any) {
         console.error("Gemini Init Error:", error);
         return NextResponse.json({ error: "[Gemini Error]: " + error.message }, { status: 500 });
       }
    }

    const response = await fetch(`${apiUrl}/chat-messages`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ 
        inputs: inputs || {}, 
        query: chatMessage, 
        response_mode: "streaming", 
        conversation_id: conversationId || "", 
        user: user || "user" 
      }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json({ error: errorData.message || "Dify API Error" }, { status: response.status });
    }

    return new Response(response.body, { headers: { "Content-Type": "text/event-stream" } });
  } catch (error: any) {
    console.error("API Route Error:", error);
    const errorMessage = error.message || "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
