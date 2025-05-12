import { Pinecone } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./db/embeddings";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import fs from "fs";
import path from "path";

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string
) {
  try {
    const client = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    const pineconeIndex = await client.Index("chat-with-pdf");
    const namespace = pineconeIndex.namespace(convertToAscii(fileKey));

    const queryResult = await namespace.query({
      topK: 5,
      vector: embeddings,
      includeMetadata: true,
    });

    return queryResult.matches || [];
  } catch (error) {
    console.log("Error querying embeddings", error);
    throw error;
  }
}
export async function getContext(query: string, fileKey: string) {
  const queryEmbeddings = await getEmbeddings(query);
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

  // Filter relevant documents based on similarity score
  const qualifyingDocs = matches.filter(
    (match) => match.score && match.score > 0.7
  );

  type Metadata = {
    text: string;
    pageNumber: number;
  };

  // Include both text and page number in the extracted context
  const docs = qualifyingDocs.map((match) => {
    const metadata = match.metadata as Metadata;
    return `**(Page ${metadata.pageNumber}):** ${metadata.text}`;
  });

  // Join extracted context and limit size
  const extractedContext = docs.join("\n\n").substring(0, 3000);

  return extractedContext;
}

export async function getContextFlashcard(fileKey: string): Promise<string> {
  try {
    // Simulate downloading the file from S3
    const filePath = path.resolve("/tmp", fileKey); // Adjust the path as needed
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    console.log(`Loading PDF from: ${filePath}`);
    const loader = new PDFLoader(filePath);
    const documents = await loader.load();

    // Combine all page content into a single string
    const context = documents.map((doc) => doc.pageContent).join("\n");
    console.log("Extracted context:", context);

    return context;
  } catch (error) {
    console.error("Error in getContext:", error);
    throw new Error("Failed to extract context from the file.");
  }
}
