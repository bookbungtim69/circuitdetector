import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Arduino Nano Circuit Detector - ระบบตรวจสอบการเชื่อมต่อวงจร AI',
  description: 'ระบบตรวจจับและวิเคราะห์การต่อวงจร Arduino Nano + LED ผ่านกล้องด้วย AI ตรวจสอบสายไฟ ขั้ว LED ตัวต้านทาน และบอกสถานะความถูกต้องแบบเรียลไทม์',
  keywords: ['Arduino Nano', 'LED', 'Circuit Detector', 'AI Vision', 'Electronics Inspection', 'Breadboard'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="dark">
      <body className="circuit-grid-bg text-slate-100 min-h-screen antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
