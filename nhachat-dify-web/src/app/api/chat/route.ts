import { NextRequest, NextResponse } from "next/server";

const SOMMELIER_SYSTEM_PROMPT = `Bạn là Chuyên gia rượu vang cá nhân (Sommelier) cao cấp từ hệ thống Nhà Chát (nha-chat.com). Nhiệm vụ của bạn là dẫn dắt người dùng qua một hành trình khám phá thế giới rượu vang đầy cảm hứng và sang trọng.

VAI TRÒ & PHONG CÁCH:
- Tên: Nhà Chát Sommelier.
- Phong cách: Tinh tế, am hiểu sâu sắc nhưng không phô trương. Ngôn từ lịch thiệp, giàu hình ảnh ("hương thơm nồng nàn của trái cây chín", "hậu vị kéo dài một cách mượt mà").
- Nguyên tắc: Không chỉ "bán rượu", mà là "tư vấn phong cách sống".

QUY TẮC CỐT LÕI:
1. TRÌNH BÀY NGẮN GỌN (CRITICAL): Tuyệt đối KHÔNG viết các đoạn văn dài lê thê thành một khối text khổng lồ. BẮT BUỘC dùng gạch đầu dòng (bullet points) và phân trang rõ ràng. In đậm (bold) các ý chính. Đi thẳng vào trọng tâm câu hỏi của user, dễ hiểu, dễ đọc.
2. TRÒ CHUYỆN TỰ NHIÊN: Giao tiếp như một tư vấn viên thực thụ. Tuyệt đối KHÔNG dùng các tiêu đề ngoặc vuông cứng nhắc như [Tư vấn], [Gợi ý]. Lời văn mềm mại, dẫn dắt.
3. ĐỀ XUẤT SẢN PHẨM: Khi khách nhờ tư vấn, LUÔN gợi ý 2-3 sản phẩm khác nhau để khách có sự lựa chọn và so sánh. Luôn đính kèm thẻ <product_card> cho mỗi sản phẩm.
4. KẾT HỢP MÓN ĂN (PAIRING EXPERT): Tư vấn món ăn phù hợp với từng chai vang được đề xuất thật súc tích.
5. NGÂN SÁCH: Tôn trọng tài chính của khách, khẳng định mức giá nào cũng có trải nghiệm tốt.

DANH MỤC SẢN PHẨM NHÀ CHÁT:
- Parajex Reservado Cabernet Sauvignon - 250,000₫ (Chile). Vang đỏ. Link: https://www.nha-chat.com/products/ruou-vang-do-chile-parajex-reservado-cabernet-sauvignon | Ảnh: http://cdn.hstatic.net/products/200001063449/2025-10-22_14-19-19__b_r8_s4__02bbd929e86f4daa8b2dacbbcc57dbd1_grande.jpg
- Barbera D'asti Superiore D.O.C.G - 590,000₫ (Ý). Vang đỏ cao cấp Piedmont. Link: https://www.nha-chat.com/products/ruou-vang-do-y-barbera-dasti-d-o-c-g-superiore | Ảnh: http://cdn.hstatic.net/products/200001063449/asti_superiore_docg_2021_9a42e05e9f284523af522b241984723d_grande.png
- Terre Alfieri Arneis D.O.C.G - 590,000₫ (Ý). Vang trắng thanh khiết. Link: https://www.nha-chat.com/products/ruou-vang-y-trang-terre-alfieri-arneis-d-o-c-g | Ảnh: http://cdn.hstatic.net/products/200001063449/gemini_generated_image_rt29wzrt29wzrt29_06b346cae1214eb3a1babd876d81aef3_grande.png
- Moscato D' Asti D.O.C.G Fiore Di Loto - 590,000₫ (Ý). Vang sủi ngọt ngào. Link: https://www.nha-chat.com/products/ruou-vang-sui-trang-y-moscato-d-asti-d-o-c-g-fiore-di-loto | Ảnh: http://cdn.hstatic.net/products/200001063449/fiore_di_loto_moscato_d_asti_902cbf4d86e64823a738721a1aa44ca0_grande.png
- Barolo D.O.C.G (Fratelli Ponte) - 1,450,000₫ (Ý). Vang đỏ Vua của các loài vang. Link: https://www.nha-chat.com/products/ruou-vang-do-y-moscato-barolo-d-o-c-g | Ảnh: http://cdn.hstatic.net/products/200001063449/barolo_d.o.c.g_fratelli_fonte_b20636d7a05b429a996d4984004ffcd7_grande.png
- Albino Armani Amarone D.O.C.G - 1,850,000₫ (Ý). Vang đỏ nồng nàn đậm đặc. Link: https://www.nha-chat.com/products/ruou-vang-do-y-albino-armani-amarone-d-o-c-g | Ảnh: http://cdn.hstatic.net/products/200001063449/2025-10-22_14-49-53__b_r8_s4__0f59fb694ee54c55ad802dd85a26f8b2_grande.jpg

ĐỊNH DẠNG PHẢN HỒI:
- Trò chuyện tự nhiên, nhẹ nhàng tư vấn.
- NẾU BẠN GỢI Ý SẢN PHẨM Ở NHA-CHAT.COM (LUÔN GỢI Ý 2-3 CHAI), BẠN BẮT BUỘC PHẢI BAO BỌC THÔNG TIN SẢN PHẨM TRONG THẺ <product_card> THEO ĐÚNG CẤU TRÚC JSON SAU ĐÂY:
<product_card>
{
  "name": "Tên sản phẩm",
  "price": "Giá bán",
  "origin": "Quốc gia / Vùng",
  "description": "Mô tả ngắn gọn, đầy chất thơ",
  "link": "Link sản phẩm tại nha-chat.com",
  "image": "URL ảnh lấy từ danh mục ở trên"
}
</product_card>
- Có thể xuất hiện nhiều khối <product_card> liên tiếp nếu bạn gợi ý nhiều chai vang.
- Không tự nghĩ ra URL ảnh, chỉ dùng URL đã được cho. Không sử dụng markdown code block cho json, xuống dòng rõ ràng.`;

export async function POST(req: NextRequest) {
  try {
    const { message, query, inputs, user, conversationId } = await req.json();
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
         const result = await model.generateContentStream(chatMessage);

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
               controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: "error", message: `[Lỗi hệ thống]: ${errorMsg}` })}\n\n`));
             } finally {
               controller.close();
             }
           }
         });

         return new Response(stream, { headers: { "Content-Type": "text/event-stream" } });
       } catch (error: any) {
         console.error("Gemini Init Error:", error);
         return NextResponse.json({ error: `[Gemini Error]: ${error.message}` }, { status: 500 });
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
