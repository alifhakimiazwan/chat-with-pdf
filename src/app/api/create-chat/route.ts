import { loadS3IntoPinecone } from "@/lib/db/pinecone";
import { NextResponse } from "next/server";
import { chats } from "@/lib/db/schema";
import { getS3Url } from "@/lib/db/s3";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request, res: Response) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    console.log(req.body);
    const body = await req.json();
    const { file_name, file_key } = body;
    console.log(file_name, file_key);
    await loadS3IntoPinecone(file_key);
    const chat_id = await db
      .insert(chats)
      .values({
        fileKey: file_key,
        pdfName: file_name,
        pdfUrl: getS3Url(file_key),
        userId,
      })
      .returning({
        insertedId: chats.id,
      });
    return NextResponse.json(
      {
        chat_id: chat_id[0].insertedId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Intenal server error",
      },
      { status: 500 }
    );
  }
}
