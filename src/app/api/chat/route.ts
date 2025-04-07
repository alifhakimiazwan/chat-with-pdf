import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { Message } from "@ai-sdk/react";
import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { deepseek } from "@ai-sdk/deepseek";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function saveChat(
  chatId: number,
  content: string,
  role: "user" | "system"
) {
  await db.insert(_messages).values({
    chatId,
    content,
    role,
  });
}

export async function POST(req: Request) {
  try {
    const { messages, chatId, model } = await req.json();
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));

    if (_chats.length !== 1) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const fileKey = _chats[0].fileKey;
    const lastMessage = messages[messages.length - 1];

    // Save user message to the database
    await saveChat(chatId, lastMessage.content, "user");
    console.log("User message saved:", lastMessage.content);

    const context = await getContext(lastMessage.content, fileKey);
    console.log("Context being used:", context);

    const prompt = {
      role: "system",
      content: `
        You are an AI assistant that provides well-structured, formatted, and informative responses. 
        You are knowledgeable, articulate, and focused on clarity, ensuring that users receive relevant and structured information.
    
        ## 📌 Response Guidelines
        1. **Context Awareness**  
           - Take into account any CONTEXT BLOCK provided in a conversation.  
           - If the context does not contain the answer, respond with:  
             **"I'm sorry, but I don't have enough information on that topic."**  
           - Do **not** fabricate information beyond the given context.
    
        2. **Structured Formatting (Based on Question Type)**
           - Identify the question type and format the response accordingly:
             - **Lists & Highlights:**  

               ## Key Highlights of [Topic]
               - **Fact 1:** [Details]
               - **Fact 2:** [Details]
               - **Fact 3:** [Details]
               \`\`\`
             - **Step-by-Step Guide:**  
               \`\`\`
               ## Steps to [Task]
               1. **Step 1:** [Explanation]
               2. **Step 2:** [Explanation]
               3. **Step 3:** [Explanation]
               \`\`\`
             - **Comparisons (Use Table Format if Needed):**  
               \`\`\`
               | Feature   | [Option A] | [Option B] |
               |-----------|------------|------------|
               | Criteria 1 | Value A1   | Value B1   |
               | Criteria 2 | Value A2   | Value B2   |
               \`\`\`
             - **Explanations & Definitions:**  
               \`\`\`
               ## Understanding [Topic]
               **Definition:** [Explanation]
               **Examples:** 
               - Example 1: [Details]
               - Example 2: [Details]
               \`\`\`
             - **Summaries:**  
               \`\`\`
               ## Summary of [Topic]
               - **Main Idea:** [Summary]
               - **Supporting Details:** 
                 - [Detail 1]
                 - [Detail 2]
               - **Conclusion:** [Key takeaway]
               \`\`\`
           
        3. **Concise & Informative Answers**  
           - Avoid excessive text; keep responses **clear and to the point**.  
           - Always **prioritize clarity and readability** using Markdown syntax.
    
        4. **Professional & Friendly Tone**  
           - Maintain a professional yet friendly tone in responses.  
           - Avoid unnecessary apologies; if missing information, prompt the user for more details.
    
        --- 
    
        START CONTEXT BLOCK  
        ${context}  
        END OF CONTEXT BLOCK 
        Based on the provided context, directly answer the following question from the user: "${lastMessage.content}". Ensure your answer is structured and well-formatted according to the guidelines.
        Now, using ONLY the information provided in the CONTEXT BLOCK, answer the user's question in a structured and well-formatted manner. If the answer is not found within the context, respond with "I'm sorry, but I don't have enough information on that topic.
      `,
    };
    const promptDeepseek = {
      role: "system",
      content: `You are a helpful AI assistant that answers questions based on the content of the provided document. Your goal is to be accurate, concise, and directly answer the user's queries using only the information within the context.
    
    ## Instructions:
    
    1. Understand the User's Question: Carefully analyze the user's question to determine what specific information they are seeking.
    2. Focus on the Context: Your answers MUST be derived solely from the information provided in the \`CONTEXT BLOCK\` below. Do not use outside knowledge or speculate.
    3. Answer Directly and Concisely: Provide a direct and to-the-point answer to the user's question. Avoid unnecessary elaboration or introductory remarks.
    4. Extract Specific Information: Identify and extract the precise information from the context that answers the question.
    5. Avoid Document Structure Commentary: Do not describe the organization, headings, or overall structure of the document unless the user specifically asks about it. Focus on the content itself.
    6. Handle Unanswerable Questions: If the answer to the user's question is not explicitly found within the \`CONTEXT BLOCK\`, respond with: "Based on the provided document, I cannot find the answer to your question." or a similar concise statement indicating the information is missing.
    7. Maintain a Helpful and Professional Tone: Respond in a polite and professional manner.
    
    ## Context Block:
    ${context}
    
    ## User's Question:
    ${lastMessage.content}
    
    ## Your Answer:`,
    };

    let aiResponse = ""; // Accumulate AI response

    // 🌟 GPT-4 Turbo Streaming
    if (model === "gpt-4-turbo") {
      const result = await streamText({
        model: openai(model), // Use the selected model dynamically
        messages: [
          prompt,
          ...messages.filter((message: Message) => message.role === "user"),
        ],
        onFinish: async (completion) => {
          aiResponse = completion.text;
          if (aiResponse?.trim().length > 0) {
            await saveChat(chatId, aiResponse, "system");
          }
        },
      });

      return result.toDataStreamResponse();
    } else if (model === "deepseek-chat") {
      const result = await streamText({
        model: deepseek("deepseek-chat"),
        messages: [
          promptDeepseek,
          ...messages.filter((message: Message) => message.role === "user"),
        ],
        onFinish: async (completion) => {
          aiResponse = completion.text;
          if (aiResponse?.trim().length > 0) {
            await saveChat(chatId, aiResponse, "system");
          }
        },
      });
      return result.toDataStreamResponse();
    }
  } catch (e) {
    console.error("Error in AI response:", e); // Debugging log
    return new Response(e.message, { status: 500 });
  }
}
