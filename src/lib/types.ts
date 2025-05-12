export type MCQChat = {
  chatId: number;
  pdfName: string;
  createdAt: Date;
};
export type FlashcardChat = {
  chatId: number;
  pdfName: string;
  createdAt: Date;
};
export type PodcastChat = {
  chatId: number;
  pdfName: string; // Name of the PDF file from which the podcast was generated
  createdAt: string; // Timestamp when the podcast was created
  podcastUrl: string; // URL to access the podcast file
};
