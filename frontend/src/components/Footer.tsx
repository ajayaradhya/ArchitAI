import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mt-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-opacity-90 backdrop-blur-md shadow-inner py-8 text-center text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Footer Text */}
        <p className="text-sm md:text-base font-medium mb-4">
          © {new Date().getFullYear()} ArchitAI. All rights reserved. |{" "}
          <Link
            to="/about"
            className="underline hover:text-indigo-200 transition-colors duration-300"
          >
            About
          </Link>
        </p>

        {/* Optional Social Icons */}
        <div className="flex justify-center space-x-6 mb-2">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-200 transition-colors duration-300"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.4.36a9.05 9.05 0 0 1-2.88 1.1A4.52 4.52 0 0 0 16.5 0c-2.5 0-4.5 2-4.5 4.5 0 .35.04.7.12 1.03A12.94 12.94 0 0 1 1.64 1.15a4.49 4.49 0 0 0-.61 2.26c0 1.56.8 2.93 2.03 3.73A4.48 4.48 0 0 1 1 6.75v.05c0 2.18 1.55 4 3.6 4.42a4.52 4.52 0 0 1-2.03.08c.57 1.77 2.23 3.06 4.2 3.1A9.03 9.03 0 0 1 0 19.54a12.7 12.7 0 0 0 6.88 2c8.26 0 12.78-6.84 12.78-12.78 0-.2 0-.42-.02-.63A9.2 9.2 0 0 0 23 3z" />
            </svg>
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-200 transition-colors duration-300"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.613-4.042-1.613-.546-1.387-1.333-1.756-1.333-1.756-1.089-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.834 2.807 1.304 3.492.997.108-.776.418-1.305.762-1.604-2.665-.3-5.467-1.333-5.467-5.931 0-1.31.468-2.381 1.235-3.222-.123-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 3-.405c1.02.004 2.04.138 3 .405 2.29-1.552 3.296-1.23 3.296-1.23.653 1.653.242 2.873.12 3.176.77.841 1.234 1.912 1.234 3.222 0 4.609-2.807 5.628-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .321.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-200 transition-colors duration-300"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.025-3.037-1.849-3.037-1.851 0-2.135 1.445-2.135 2.939v5.667H9.354V9h3.414v1.561h.049c.476-.899 1.637-1.849 3.368-1.849 3.598 0 4.264 2.368 4.264 5.455v6.285zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM6.984 20.452H3.689V9h3.295v11.452zM22.225 0H1.771C.792 0 0 .77 0 1.723v20.554C0 23.23.792 24 1.771 24h20.451C23.2 24 24 23.23 24 22.277V1.723C24 .77 23.2 0 22.225 0z" />
            </svg>
          </a>
        </div>

        {/* Optional tagline */}
        <p className="text-xs md:text-sm text-indigo-100/80">
          Your AI-powered system design assistant
        </p>
      </div>
    </footer>
  );
};

export default Footer;
