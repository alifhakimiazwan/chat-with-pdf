export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
  params?: { chatId?: string }; // Optional to detect chatId
}) {
  return <div>{children}</div>;
}
