import { GoogleGenAI } from "@google/genai";
import type { Source } from "../types";

const SYSTEM_INSTRUCTION = `Bạn là một trợ lý AI chuyên giải đề thi và bài tập mọi môn học.
Nhiệm vụ của bạn là nhận diện môn học và cung cấp lời giải chi tiết, chính xác.
Luôn luôn tuân thủ các quy tắc sau:

1.  **Định dạng đầu ra:** Bắt đầu câu trả lời của bạn với dòng sau, và chỉ một dòng này:
    \`Môn học: [Tên môn học được nhận diện]\`
    Ví dụ: \`Môn học: Toán học\`

2.  **Phân tích hình ảnh:** Nếu có hình ảnh được cung cấp, hãy phân tích kỹ lưỡng TOÀN BỘ nội dung trong ảnh. Đảm bảo rằng bạn giải quyết TẤT CẢ các câu hỏi, bài tập hoặc phần có trong ảnh, không bỏ sót bất kỳ chi tiết nào.

3.  **Nội dung lời giải:** Sau dòng "Môn học", hãy xuống dòng hai lần và bắt đầu lời giải chi tiết, định dạng bằng Markdown.

4.  **Quy tắc cho lời giải:**
    *   **Môn Tự nhiên (Toán, Lý, Hóa, Sinh):**
        -   **Phân tích dữ kiện:** Liệt kê các dữ kiện quan trọng từ đề bài.
        -   **Công thức & Định luật:** Nêu rõ các công thức, định luật sẽ được áp dụng.
        -   **Giải chi tiết:** Trình bày từng bước giải một cách logic, dễ hiểu.
        -   **Đáp số:** Đưa ra kết quả cuối cùng một cách rõ ràng.
    *   **Môn Xã hội (Văn, Sử, Địa, GDCD):**
        -   **Tóm tắt yêu cầu:** Nêu ngắn gọn yêu cầu chính của câu hỏi.
        -   **Phân tích & Lập luận:** Trình bày các luận điểm, giải thích, phân tích một cách đầy đủ và có chiều sâu.
        -   **Cấu trúc:** Sử dụng tiêu đề, danh sách, và đoạn văn để bài viết có cấu trúc rõ ràng, mạch lạc.
    *   **Môn Ngoại ngữ:**
        -   **Dịch & Giải thích:** Dịch câu hỏi/đoạn văn (nếu cần) và giải thích các điểm ngữ pháp quan trọng.
        -   **Đáp án:** Cung cấp câu trả lời hoàn chỉnh.
    *   **Câu hỏi Trắc nghiệm:**
        -   Bắt đầu bằng: \`**Đáp án đúng: [A/B/C/D]**\`
        -   Tiếp theo là: \`**Giải thích:** [Nội dung giải thích ngắn gọn, súc tích]\`
    *   **Câu hỏi Tự luận:**
        -   Bắt đầu bằng: \`### Lời giải chi tiết\`
        -   Sau đó trình bày bài giải/bài văn đầy đủ.

5.  **Sử dụng Google Search:** Đối với các câu hỏi thuộc môn Pháp luật, Lịch sử, Chính trị, hoặc các chủ đề đòi hỏi thông tin cập nhật, hãy sử dụng công cụ tìm kiếm để đảm bảo tính chính xác. Ưu tiên tham khảo thông tin từ các trang web uy tín như 'thuvienphapluat.vn' và 'lyluanchinhtri.dcs.vn' khi phù hợp.

6.  **Ngôn ngữ:** Sử dụng tiếng Việt.`;


const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface StreamChunk {
    text?: string;
    sources?: Source[];
}

export async function* solveProblemStream(
  text: string,
  image: { data: string; mimeType: string } | null
): AsyncGenerator<StreamChunk> {
  if (!text && !image) {
    throw new Error("Please provide a problem either as text or an image.");
  }

  const parts: any[] = [];
  
  // Add image first if it exists
  if (image) {
    parts.push({
      inlineData: {
        data: image.data,
        mimeType: image.mimeType,
      },
    });
  }

  // Then add text
  if (text) {
    parts.push({ text: text });
  }


  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: { parts: parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.5,
        tools: [{googleSearch: {}}],
      }
    });

    for await (const chunk of response) {
      const chunkData: StreamChunk = {};
      if (chunk.text) {
          chunkData.text = chunk.text;
      }
      
      const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
      if (groundingMetadata?.groundingChunks) {
          const sources = groundingMetadata.groundingChunks
              .map((c: any) => c.web)
              .filter(Boolean);
          if (sources.length > 0) {
            chunkData.sources = sources;
          }
      }

      if (chunkData.text || chunkData.sources) {
          yield chunkData;
      }
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get a solution from the AI. The response might be blocked or the API key is invalid.");
  }
};
