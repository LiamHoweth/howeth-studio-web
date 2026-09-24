import "@/styles/noctara-marketing.css";

export default function NoctaraLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="noctara-product">{children}</div>;
}
