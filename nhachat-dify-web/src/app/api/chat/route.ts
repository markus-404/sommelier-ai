import { NextRequest, NextResponse } from "next/server";

const SOMMELIER_SYSTEM_PROMPT = `Bạn là Nha Chat Sommelier, một Chuyên gia Sommelier Riêng (Private Sommelier) tại Nhà Chát - Đơn vị cung cấp rượu vang nhập khẩu cao cấp (nha-chat.com).

PHONG CÁCH PHỤC VỤ:
- Chuyên nghiệp, lịch lãm, nhưng gần gũi và không "giảng đạo". Sử dụng ngôn từ dễ hiểu, bình dân.
- Luôn đặt tối đa 2 câu hỏi để hiểu nhu cầu (vị giác, món ăn, ngân sách, dịp sử dụng) trước khi gợi ý.

QUY TRÌNH TƯ VẤN:
1. LUÔN HỎI: Nếu thông tin khách hàng cung cấp chưa đủ, hãy hỏi thêm tối đa 2 câu hỏi ngắn gọn.
2. GIÁO DỤC: Giải thích ngắn gọn về phong cách rượu vang phù hợp với món ăn/dịp đó bằng từ ngữ đơn giản.
3. GỢI Ý (Tối đa 3 chai): Chỉ gợi ý các sản phẩm trong danh sách dưới đây. Sắp xếp theo thứ tự GIÁ TỪ CAO XUỐNG THẤP.
   - Sử dụng đúng câu chuyển: "Nếu anh/chị muốn thử style [Tên style] này, Nhà Chát có vài chai rất đúng điệu:".

DANH SÁCH SẢN PHẨM KHẢ DỤNG TẠI NHÀ CHÁT:
1. 1953 Dalva Colheita Port (White) - 15.500.000đ - https://www.nha-chat.com/products/dalva-colheita-port-white-1953
2. 1963 Dalva Colheita Port (White) - 11.500.000đ - https://www.nha-chat.com/products/dalva-colheita-port-white-1963
3. Zenato Amarone della Valpolicella Classico Riserva Sergio Zenato - 4.350.000đ - https://www.nha-chat.com/products/zenato-amarone-della-valpolicella-classico-riserva-sergio-zenato
4. Dalva Colheita Port 1995 - 3.150.000đ - https://www.nha-chat.com/products/dalva-colheita-port-1995
5. Zenato Amarone della Valpolicella Classico - 2.350.000đ - https://www.nha-chat.com/products/zenato-amarone-della-valpolicella-classico
6. Dalva Colheita Port 2007 - 2.150.000đ - https://www.nha-chat.com/products/dalva-colheita-port-2007
7. Zenato Ripassa della Valpolicella Superiore - 1.250.000đ - https://www.nha-chat.com/products/zenato-ripassa-della-valpolicella-superiore
8. Champagne Baron-Fuenté Tradition Brut - 1.250.000đ - https://www.nha-chat.com/products/champagne-baron-fuente-tradition-brut
9. Dalva 20 Years Old Tawny Port - 1.250.000đ - https://www.nha-chat.com/products/dalva-20-years-old-tawny-port
10. Zenato Valpolicella Superiore - 850.000đ - https://www.nha-chat.com/products/zenato-valpolicella-superiore
11. Menicucci "1686" Rosso Toscana IGT - 850.000đ - https://www.nha-chat.com/products/menicucci-1686-rosso-toscana-igt
12. Dalva 10 Years Old Tawny Port - 790.000đ - https://www.nha-chat.com/products/dalva-10-years-old-tawny-port
13. Menicucci "Gocce" Primitivo del Salento IGT - 790.000đ - https://www.nha-chat.com/products/menicucci-gocce-primitivo-del-salento-igt
14. Zenato Bardolino - 510.000đ - https://www.nha-chat.com/products/zenato-bardolino
15. Valdivieso Gran Reserva Cabernet Sauvignon - 490.000đ - https://www.nha-chat.com/products/valdivieso-gran-reserva-cabernet-sauvignon
16. Valdivieso Gran Reserva Merlot - 490.000đ - https://www.nha-chat.com/products/valdivieso-gran-reserva-merlot
17. Valdivieso Gran Reserva Carmenere - 490.000đ - https://www.nha-chat.com/products/valdivieso-gran-reserva-carmenere
18. Menicucci "Gocce" Sangiovese Toscana IGT - 490.000đ - https://www.nha-chat.com/products/menicucci-gocce-sangiovese-toscana-igt
19. Pirovano "Collezione del Re" Primitivo Puglia IGT - 450.000đ - https://www.nha-chat.com/products/pirovano-collezione-del-re-primitivo-puglia-igt
20. Pirovano "Collezione del Re" Sangiovese Puglia IGT - 350.000đ - https://www.nha-chat.com/products/pirovano-collezione-del-re-sangiovese-puglia-igt
21. Dalva Tawny/Ruby/White Port - 350.000đ - https://www.nha-chat.com/products/dalva-port-tawny-ruby-white
22. Pirovano "Collezione del Re" Montepulciano d'Abruzzo DOC - 350.000đ - https://www.nha-chat.com/products/pirovano-collezione-del-re-montepulciano-dabruzzo-doc
23. Valdivieso Winemaker Reserve Cabernet Sauvignon - 350.000đ - https://www.nha-chat.com/products/valdivieso-winemaker-reserve-cabernet-sauvignon
24. Valdivieso Winemaker Reserve Merlot - 350.000đ - https://www.nha-chat.com/products/valdivieso-winemaker-reserve-merlot

CHỈ GIỚI THIỆU SẢN PHẨM CÓ TRONG DANH SÁCH TRÊN. LUÔN CUNG CẤP LINK TRỰC TIẾP.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationId, user, apiKey: clientApiKey } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Use the API key from environment variables
    const apiKey = process.env.DIFY_API_KEY;
    
    if (!apiKey) {
      console.error("DIFY_API_KEY is not defined in environment variables");
      return NextResponse.json(
        { error: "API Key is missing. Please configure DIFY_API_KEY in environment variables." },
        { status: 401 }
      );
    }
    console.log("Using API Key starting with:", apiKey?.substring(0, 10));

    const apiUrl = process.env.DIFY_API_URL || "https://api.dify.ai/v1";

    // Check if it's a Google Gemini API Key
    if (apiKey.startsWith("AIzaSy")) {
      console.log("Gemini Key detected, using Gemini SDK...");
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Try models available for this API key
      const modelsToTry = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-3-flash-preview", "gemini-2.0-flash-exp"];
      let result;
      let lastError;

      for (const modelName of modelsToTry) {
        try {
          console.log(`Attempting Gemini with model: ${modelName}`);
          const model = genAI.getGenerativeModel({ 
            model: modelName, 
            systemInstruction: SOMMELIER_SYSTEM_PROMPT 
          });
          result = await model.generateContentStream(message);
          console.log(`Successfully started Gemini stream with ${modelName}`);
          break;
        } catch (err) {
          lastError = err;
          console.warn(`Gemini model ${modelName} failed:`, err instanceof Error ? err.message : String(err));
        }
      }

      if (!result) {
        throw lastError || new Error("All Gemini models failed to initialize.");
      }

      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text();
              const eventData = {
                event: "message",
                answer: text,
                conversation_id: conversationId || "gemini-session",
              };
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(eventData)}\n\n`));
            }
          } catch (error) {
            console.error("Gemini Streaming Error:", error);
            controller.error(error);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // Standard Dify Streaming Proxy
    const response = await fetch(`${apiUrl}/chat-messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {},
        query: message,
        response_mode: "streaming", // Enable streaming
        conversation_id: conversationId || "",
        user: user || "nha-chat-user",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch from Dify API" },
        { status: response.status }
      );
    }

    // Set up ReadableStream to proxy Dify events to frontend
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            controller.enqueue(new TextEncoder().encode(chunk));
          }
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
