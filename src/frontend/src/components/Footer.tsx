import { Link } from "@tanstack/react-router";
import { Scale } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[oklch(0.18_0.1_255)] text-blue-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 font-bold text-white text-lg mb-3">
            <Scale className="w-5 h-5 text-blue-300" />
            LegalConnect
          </div>
          <p className="text-sm text-blue-200">
            Connecting clients with verified lawyers across India.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Platform</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/lawyers" className="hover:text-white transition-colors">
              Find a Lawyer
            </Link>
            <Link
              to="/post-requirement"
              className="hover:text-white transition-colors"
            >
              Post Requirement
            </Link>
            <Link to="/blog" className="hover:text-white transition-colors">
              Legal Resources
            </Link>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Company</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/about" className="hover:text-white transition-colors">
              About Us
            </Link>
            <Link to="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Legal</h4>
          <div className="flex flex-col gap-2 text-sm">
            <span className="text-blue-300">Privacy Policy</span>
            <span className="text-blue-300">Terms of Service</span>
          </div>
        </div>
      </div>
      <div className="border-t border-blue-800 text-center py-4 text-sm text-blue-300">
        &copy; {new Date().getFullYear()} LegalConnect. Not a law firm. We
        connect you with lawyers.
      </div>
    </footer>
  );
}
