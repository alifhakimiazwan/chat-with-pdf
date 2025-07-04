import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import md5 from "md5";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";

import { convertToAscii } from "../utils";
import { getEmbeddings } from "./embeddings";

export const getPineconeClient = () => {
  return new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadS3IntoPinecone(fileKey: string) {
  const isConnected = await testPineconeConnection();
  if (!isConnected) {
    throw new Error("could not connect to pinecone");
  }
  // 1. obtain the pdf -> downlaod and read from pdf
  console.log("downloading s3 into file system");
  const file_name = await downloadFromS3(fileKey);
  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];

  // 2. split and segment the pdf
  console.log("splitting pdf into segments");
  const documents = await Promise.all(pages.map(prepareDocument));

  // 3. vectorise and embed individual documents
  console.log("embedding documents");
  const vectors = await Promise.all(documents.flat().map(embedDocument));

  // 4. upload to pinecone
  console.log("uploading to pinecone");
  const client = await getPineconeClient();
  const pineconeIndex = await client.Index("chat-with-pdf");
  const namespace = pineconeIndex.namespace(convertToAscii(fileKey));

  console.log("inserting vectors into pinecone");
  await namespace.upsert(vectors);

  return documents[0];
}

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as PineconeRecord;
  } catch (error) {
    console.log("error embedding document", error);
    throw error;
  }
}

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
  let { pageContent } = page;
  const { metadata } = page;
  pageContent = pageContent.replace(/\n/g, "");
  // split the docs
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);
  return docs;
}

export const testPineconeConnection = async () => {
  try {
    console.log("🔍 Testing Pinecone connection...");
    const client = getPineconeClient();

    // List available indexes
    const indexes = await client.listIndexes();
    console.log("✅ Available indexes:", indexes);

    console.log("✅ Pinecone index is accessible.");
    return true;
  } catch (error) {
    console.error("❌ Pinecone connection error:", error);
    return false;
  }
};
