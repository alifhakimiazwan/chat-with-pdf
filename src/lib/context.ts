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

// Function to identify question type (comparison, explanation, list, generic)
function getQuestionType(question: string): string {
  if (question.includes("compare") || question.includes("difference"))
    return "comparison";
  if (question.startsWith("why") || question.startsWith("how"))
    return "explanation";
  if (question.includes("list") || question.includes("what are")) return "list";
  return "generic";
}

export async function getDynamicContext(userQuestion: string, fileKey: string) {
  // Step 1: Get the initial context
  let context = await getContext(userQuestion, fileKey);

  // Step 2: If no context, try a question-type-based fallback
  if (!context) {
    console.log(
      "No direct context found. Trying question-type-based fallback..."
    );

    const questionType = getQuestionType(userQuestion);
    const fallbackQueries = {
      comparison: ["differences", "similarities", "comparison of"],
      explanation: ["reasons", "causes", "explanation of"],
      list: ["key points", "main topics", "list of"],
      generic: ["overview", "summary", "general information"],
    };

    const possibleQueries = fallbackQueries[questionType];

    for (const query of possibleQueries) {
      context = await getContext(query, fileKey);
      if (context) break;
    }
  }

  // Step 3: If still no context, try recent topics or commonly asked questions
  if (!context) {
    console.log(
      "Still no context. Trying recent topics or related concepts..."
    );
    const relatedQueries = [
      "introduction",
      "summary",
      "main points",
      "key concepts",
    ];
    for (const related of relatedQueries) {
      context = await getContext(related, fileKey);
      if (context) break;
    }
  }

  // Step 4: Combine contexts if multiple fragments are found
  if (Array.isArray(context) && context.length > 1) {
    console.log("Combining multiple context fragments...");
    context = context.join("\n\n");
  }

  // Final check before returning
  if (!context) {
    console.log("No relevant context found after multiple attempts.");
    return "";
  }

  return context;
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
