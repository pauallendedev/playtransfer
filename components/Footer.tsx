// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="mt-8 p-4 bg-white/80 backdrop-blur-sm text-center text-sm text-gray-600">
      © {new Date().getFullYear()} PlayTransfer. All rights reserved.
    </footer>
  );
}
