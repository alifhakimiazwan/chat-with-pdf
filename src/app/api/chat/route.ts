import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { Message } from "@ai-sdk/react";
import { getDynamicContext } from "@/lib/context";
import { db } from "@/lib/db";
import { saveChat } from "@/lib/db/dbAction";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, chatId, model } = await req.json();
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
    const openAIModel = openai("gpt-4-turbo");

    if (_chats.length !== 1) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const fileKey = _chats[0].fileKey;
    const lastMessage = messages[messages.length - 1];

    // Save user message to the database
    await saveChat(chatId, lastMessage.content, "user");
    console.log("User message saved:", lastMessage.content);

    const context = await getDynamicContext(lastMessage.content, fileKey);
    console.log("Context being used:", context);

    const prompt = {
      role: "system",
      content: `
        You are an AI assistant specialized in understanding documents and answering questions based on given content. 
    
        ## 📌 Response Guidelines:
        1. **Context Awareness:**
           - Always consider the CONTEXT BLOCK provided.
           - Use the context to answer questions, especially when comparisons or reasoning are involved.
           - If a question is vague or uses pronouns like "this" or "that", infer the most relevant context from the recent content.
    
        2. **Handling Comparisons:**
           - If asked to "compare" or "analyze" two or more elements, present the response in a table or bullet points.
           - Use structured comparisons to clarify differences and similarities.
    
        3. **Dealing with Vague References:**
           - If the question contains vague terms like "this", "that", or "they", refer to the most recent relevant context in the provided content.
           - If the reference is ambiguous, ask for clarification.
    
        4. **Structured and Clear Answers:**
           - Format responses with proper headings and bullet points.
           - Use tables when comparing or listing features.
    
        5. **Avoid Guessing:**
           - If the answer is not explicitly stated in the context, respond with: 
             **"I'm sorry, but I don't have enough information on that topic."**
    
        ---
        START CONTEXT BLOCK  
        ${context}  
        END OF CONTEXT BLOCK 
    
        Now, based on the provided context, directly answer the following question from the user: "${lastMessage.content}". 
        Use structured formatting as instructed. 
      `,
    };

    let aiResponse = ""; // Accumulate AI response

    // 🌟 GPT-4 Turbo Streaming

    const result = await streamText({
      model: openAIModel,
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
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error("Error in AI response:", e); // Now `e` is typed as `Error`
      return new Response(e.message, { status: 500 });
    } else {
      console.error("Unknown error:", e); // Handle other types of errors if necessary
      return new Response("Unknown error occurred", { status: 500 });
    }
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get("chatId");

  if (!chatId) {
    return NextResponse.json({ error: "Missing chatId" }, { status: 400 });
  }

  try {
    const result = await db
      .select()
      .from(chats)
      .where(eq(chats.id, parseInt(chatId)))
      .then((res) => res[0]);

    if (!result) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
