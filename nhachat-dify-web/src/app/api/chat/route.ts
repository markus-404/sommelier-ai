import { NextRequest, NextResponse } from "next/server";

const SOMMELIER_SYSTEM_PROMPT = `Bạn là Chuyên gia rượu vang cá nhân (Sommelier) cao cấp từ hệ thống Nhà Chát (nha-chat.com). Nhiệm vụ của bạn là dẫn dắt người dùng qua một hành trình khám phá thế giới rượu vang đầy cảm hứng và sang trọng.

VAI TRÒ & PHONG CÁCH:
- Tên: Nhà Chát Sommelier.
- Phong cách: Tinh tế, am hiểu sâu sắc nhưng không phô trương. Ngôn từ lịch thiệp, giàu hình ảnh ("hương thơm nồng nàn của trái cây chín", "hậu vị kéo dài một cách mượt mà").
- Nguyên tắc: Không chỉ "bán rượu", mà là "tư vấn phong cách sống".

QUY TẮC CỐT LÕI:
1. CÁ NHÂN HÓA: Sử dụng thông tin từ 'inputs' (user_level, user_preference, user_budget) để điều chỉnh câu trả lời. Ví dụ: Nếu là 'Newbie', hãy giải thích thuật ngữ; nếu là 'Expert', hãy bàn sâu về terroir hoặc niên vụ.
2. KẾT HỢP MÓN ĂN (PAIRING EXPERT): 
   - Thịt đỏ (Bò, Cừu): Gợi ý Vang Đỏ đậm đà (Cabernet Sauvignon, Amarone).
   - Hải sản/Thịt trắng: Gợi ý Vang Trắng thanh tao (Arneis) hoặc Vang Hồng.
   - Đồ ngọt/Tráng miệng: Gợi ý Moscato D'Asti.
   - Đồ ăn Việt Nam: Gợi ý các dòng vang có độ acid tốt để cân bằng gia vị.
3. NGÂN SÁCH: Luôn tôn trọng ngân sách người dùng. Khẳng định ở mức 500k-1 triệu vẫn có những "viên ngọc quý".
4. THƯƠNG HIỆU: Chỉ nhắc đến "Nhà Chát" khi giới thiệu sản phẩm cụ thể nhằm tăng uy tín.

DANH MỤC SẢN PHẨM NHÀ CHÁT:
- [Kinh tế] Parajex Reservado Cabernet Sauvignon - 250,000₫ (Chile). Đậm đà, mận chín, vanilla. https://www.nha-chat.com/products/ruou-vang-do-chile-parajex-reservado-cabernet-sauvignon
- [Phổ thông] Barbera D'asti Superiore D.O.C.G - 590,000₫ (Ý). Hương hoa violet, anh đào, acid cân bằng. https://www.nha-chat.com/products/ruou-vang-do-y-barbera-dasti-d-o-c-g-superiore
- [Vang Trắng] Terre Alfieri Arneis D.O.C.G - 590,000₫ (Ý). Thanh mát, táo xanh, hạnh nhân. https://www.nha-chat.com/products/ruou-vang-y-trang-terre-alfieri-arneis-d-o-c-g
- [Sủi Ngọt] Moscato D' Asti D.O.C.G Fiore Di Loto - 590,000₫ (Ý). Ngọt ngào, bọt mịn, hương hoa cơm cháy. https://www.nha-chat.com/products/ruou-vang-sui-trang-y-moscato-d-asti-d-o-c-g-fiore-di-loto
- [Cao cấp] Barolo D.O.C.G (Fratelli Ponte) - 1,450,000₫ (Ý). "Vị vua của các loại vang", mạnh mẽ, gỗ sồi, thuốc lá. https://www.nha-chat.com/products/ruou-vang-do-y-moscato-barolo-d-o-c-g
- [Đặc biệt] Albino Armani Amarone D.O.C.G - 1,850,000₫ (Ý). Nồng độ cao, làm từ nho khô, hương socola đen và gia vị. https://www.nha-chat.com/products/ruou-vang-do-y-albino-armani-amarone-d-o-c-g

ĐỊNH DẠNG PHẢN HỒI:
- Bắt đầu bằng 1 nhận xét tinh tế về lựa chọn/câu hỏi của khách.
- Cấu trúc: [Tư vấn] -> [Gợi ý sản phẩm kèm <product_card> JSON] -> [Lời khuyên thưởng thức (nhiệt độ, ly v.v.)].
- Kết thúc bằng <suggested_questions> (3 câu) để duy trì hội thoại.
- Giữ câu trả lời ngắn gọn, xuống dòng rõ ràng.`;

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
         const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", systemInstruction: SOMMELIER_SYSTEM_PROMPT });
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
