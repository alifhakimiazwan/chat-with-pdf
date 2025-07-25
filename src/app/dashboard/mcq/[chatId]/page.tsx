import MCQViewer from "@/components/MCQViewer";

export default function FlashcardPage({
  params,
}: {
  params: { chatId: string };
}) {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-start py-8 px-4"
      style={{
        backgroundColor: "#ffffff",
        backgroundImage: `
      linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
    `,
        backgroundSize: "40px 40px",
      }}
    >
      <h1 className="text-3xl font-bold text-gray-800 mb-6 font-telegraf font-black">
        MCQ
      </h1>

      <div className="w-full max-w-6xl">
        <MCQViewer chatId={parseInt(params.chatId)} />
      </div>
    </div>
  );
}
