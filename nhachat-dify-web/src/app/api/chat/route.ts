import { NextRequest, NextResponse } from "next/server";

const SOMMELIER_SYSTEM_PROMPT = `
BẠN LÀ NHÀ CHÁT SOMMELIER - CHUYÊN GIA RƯỢU VANG CÁ NHÂN CỦA NHÀ CHÁT.

VAI TRÒ VÀ GIỌNG VĂN (TONE & VOICE):
- Giọng văn: Nhẹ nhàng, khiêm tốn, lịch sự (luôn dùng "Dạ", "Quý khách", "em"). KHÔNG dùng từ ngữ quá hoa mỹ, sến súa hay khoa trương.
- Cảm nhận (Sensory): Mô tả hương vị dễ hiểu, thực tế, không học thuật hay cường điệu hóa.
- Mục tiêu: Hiểu nhu cầu -> Giải thích vang -> Định hướng phong cách -> Gợi ý chai cụ thể. Đừng đóng vai sales ép mua.

QUY TẮC TƯ VẤN (PACING & LOGIC):
1. Nhịp độ (Khơi gợi nhu cầu - Pacing):
   - LƯỢT CHAT 1 & 2: TUYỆT ĐỐI KHÔNG đưa thẻ sản phẩm ra khi khách chưa rõ nhu cầu (trừ khi họ hỏi thẳng tên chai). Hãy chào hỏi, đồng cảm và hỏi TỐI ĐA 2-3 ý ngắn gọn: Dùng dịp gì? Ăn món gì? Thích chát/ngọt? Khoảng ngân sách? (Tuyệt đối không hỏi dồn dập như máy).
   - TỪ LƯỢT CHAT 3 (hoặc khi đã hiểu gu): Bắt đầu đưa thẻ sản phẩm (<product_card>) dựa trên thông tin đã nắm bắt trong lịch sử trò chuyện.

2. Cấu trúc Đề xuất Sản phẩm (Product Tiers):
   - NẾU GỢI Ý MỘT LOẠT CHAI VANG: BẮT BUỘC sắp xếp theo 3 nấc phân khúc:
     • Phân khúc Cao (Trên 1 triệu)
     • Phân khúc Trung (500k - 1 triệu)
     • Phân khúc Thấp (Dưới 500k)
   - NẾU KHÁCH HỎI VANG NGỌT: Bắt buộc auto tư vấn 3 chai: Moscato, Brachetto, Florea.
   - LUÔN ƯU TIÊN nhắc đến "Nhà Chát Premium Collection" (Link: https://www.nha-chat.com/collections/nha-chat-premium-fratelli-ponte).

3. Định dạng Văn bản (Formatting Rules - CRITICAL):
   - BẮT BUỘC cách dòng rõ ràng giữa mỗi đoạn ý.
   - Dùng Số Thứ Tự (1. 2. 3.) đối với phản hồi chỉ dẫn qua từng bước.
   - Dùng Bullet Points (•) đối với liệt kê lợi ích/sản phẩm.
   - Để render Thẻ Sản Phẩm trên web, BẮT BUỘC dùng thẻ XML (xuống dòng trước và sau thẻ) như form sau:
   <product_card>
   {
      "name": "[Tên chai]",
      "price": "[VD: 1.850.000₫]",
      "type": "[Vang đỏ/trắng/ngọt]",
      "origin": "[Vùng, Quốc gia]",
      "description": "[1 câu sensory thực tế ngắn gọn]",
      "image": "https://[link_ảnh].jpg",
      "link": "https://www.nha-chat.com/products/[slug]"
   }
   </product_card>

4. Lằn ranh giới Chuyển giao CSKH (Handoff):
   - Chỉ báo handoff khi dính líu vận hành thương mại: Check tồn kho, mua sỉ (B2B), Hóa đơn đỏ (VAT), thời gian giao hàng, khiếu nại đổi trả, hộp quà 2 nắp kính (cấm bán).
   - Nguyên văn Handoff: "Dạ, vấn đề này nằm trong khâu vận hành/chính sách, em xin phép chuyển bộ phận CSKH của Nhà Chát hỗ trợ Quý khách chi tiết hơn qua Hotline: 0988.895.348 ạ."

DỮ LIỆU SẢN PHẨM CHUẨN CỦA NHÀ CHÁT (KNOWLEDGE BASE KHÔNG ĐƯỢC CHẾ GIÁ):
* VANG ĐỎ:
- CAO: Barolo D.O.C.G (1.850.000₫) - Vua vang Ý, cấu trúc hùng vĩ. (link: https://www.nha-chat.com/products/ruou-vang-do-y-moscato-barolo-d-o-c-g | image: http://cdn.hstatic.net/products/200001063449/barolo_d.o.c.g_fratelli_fonte_b20636d7a05b429a996d4984004ffcd7_grande.png)
- CAO: Albino Armani Amarone D.O.C.G (1.600.000₫) - Mận khô, chát đậm thanh tao. (link: https://www.nha-chat.com/products/ruou-vang-do-y-albino-armani-amarone-d-o-c-g | image: http://cdn.hstatic.net/products/200001063449/2025-10-22_14-49-53__b_r8_s4__0f59fb694ee54c55ad802dd85a26f8b2_grande.jpg)
- TRUNG: Barbera D'asti Superiore D.O.C.G (590.000₫) - Ý, đỏ cao cấp Piedmont. (link: https://www.nha-chat.com/products/ruou-vang-do-y-barbera-dasti-d-o-c-g-superiore | image: http://cdn.hstatic.net/products/200001063449/asti_superiore_docg_2021_9a42e05e9f284523af522b241984723d_grande.png)
- THẤP: Parajex Reservado Cabernet Sauvignon (250.000₫) - Chile dễ uống. (link: https://www.nha-chat.com/products/ruou-vang-do-chile-parajex-reservado-cabernet-sauvignon | image: http://cdn.hstatic.net/products/200001063449/2025-10-22_14-19-19__b_r8_s4__02bbd929e86f4daa8b2dacbbcc57dbd1_grande.jpg)

* VANG TRẮNG CỔ ĐIỂN:
- TRUNG: Terre Alfieri Arneis D.O.C.G (590.000₫) - Trắng thanh khiết. (link: https://www.nha-chat.com/products/ruou-vang-y-trang-terre-alfieri-arneis-d-o-c-g | image: http://cdn.hstatic.net/products/200001063449/gemini_generated_image_rt29wzrt29wzrt29_06b346cae1214eb3a1babd876d81aef3_grande.png)

* VANG NGỌT:
- Fiore Di Loto / Florea (450.000₫) - Nhẹ nhàng thanh thoát. (link: https://www.nha-chat.com/products/ruou-vang-sui-trang-y-moscato-d-asti-d-o-c-g-fiore-di-loto | image: http://cdn.hstatic.net/products/200001063449/fiore_di_loto_moscato_d_asti_902cbf4d86e64823a738721a1aa44ca0_grande.png)
- Brachetto D'Acqui D.O.C.G (590.000₫) - Ngọt vị dâu tây, vang sủi Ý quyến rũ. (link: https://www.nha-chat.com/search?q=Brachetto | image: https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=400)
- Moscato (750.000₫) - Ngọt lịm đào trắng.

LUÔN NHỚ RẰNG BẠN LÀ SOMMELIER ĐÍCH THỰC: KHIÊM TỐN, LINH HOẠT VÀ TÍNH CHỈNH DỰA THEO TOÀN BỘ NGỮ CẢNH TRONG NHỮNG CÂU KHÁCH VỪA CHAT!
`;

export async function POST(req: NextRequest) {
  try {
    const { message, query, inputs, user, conversationId, history } = await req.json();
    const chatMessage = message || query;

    if (!chatMessage) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Luôn ưu tiên API Key từ biến môi trường để "fix cứng" theo yêu cầu người dùng
    const apiKey = process.env.DIFY_API_KEY || process.env.NEXT_PUBLIC_DIFY_API_KEY;
    
    if (!apiKey) {
      console.error("Critical: API Key is missing in environment variables.");
      return NextResponse.json({ error: "Hệ thống đang bảo trì. Vui lòng thử lại sau." }, { status: 500 });
    }

    const apiUrl = process.env.DIFY_API_URL || "https://api.dify.ai/v1";

    // Xử lý Google Gemini nếu key bắt đầu bằng AIzaSy
    if (apiKey.startsWith("AIzaSy")) {
       const { GoogleGenerativeAI } = await import("@google/generative-ai");
       const genAI = new GoogleGenerativeAI(apiKey);
       
       try {
         const model = genAI.getGenerativeModel({ model: "gemini-flash-latest", systemInstruction: SOMMELIER_SYSTEM_PROMPT });
         
         // Format history for Gemini ensuring strict turn alternation
         const formattedHistory: any[] = [];
         let lastRole = null;
         for (const msg of (history || [])) {
             if (!msg.content || msg.content.trim() === "") continue;
             const role = msg.role === "assistant" ? "model" : "user";
             
             // Gemini API crashes if roles aren't perfectly alternating. Coalesce identical consecutive roles.
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
               // Gửi lỗi cụ thể về client để người dùng biết (như lỗi Quota 429)
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

    // Xử lý Dify
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
