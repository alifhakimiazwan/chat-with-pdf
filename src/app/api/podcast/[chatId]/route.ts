import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { podcasts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatId = params.chatId;

    // If chatId is provided, fetch a specific podcast
    if (chatId) {
      const result = await db
        .select()
        .from(podcasts)
        .where(eq(podcasts.chatId, parseInt(chatId)));

      if (result.length === 0) {
        return NextResponse.json(
          { message: "Podcast not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(result[0]);
    }

    // If no chatId is provided, fetch all podcasts
    const allPodcasts = await db.select().from(podcasts);

    if (allPodcasts.length === 0) {
      return NextResponse.json(
        { message: "No podcasts available" },
        { status: 404 }
      );
    }

    return NextResponse.json(allPodcasts);
  } catch (err) {
    console.error("Error fetching podcasts:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
