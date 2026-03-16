import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[#020617] py-12 px-5 md:px-12">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-5">
        <div className="flex items-center gap-2">
          <Image src="/logo-icon.svg" alt="CodeSesh" width={40} height={40} />
          <span className="text-lg font-semibold text-gray-100">codesesh</span>
        </div>

        <p className="text-sm text-gray-400 text-center">
          Realtime collaborative code editing. No setup required.
        </p>

        <div className="flex items-center gap-6 text-xs text-gray-500">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition-colors"
          >
            GitHub
          </a>
          <span className="text-gray-700">|</span>
          <span>Built with Next.js, Monaco &amp; Rust</span>
        </div>
      </div>
    </footer>
  );
}
