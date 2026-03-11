import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { LogOut, Menu, Scale, User, X } from "lucide-react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { Button } from "./ui/button";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { actor } = useActor();

  const { data: profile } = useQuery({
    queryKey: ["userProfile", identity?.getPrincipal().toString()],
    queryFn: () => actor!.getCallerUserProfile(),
    enabled: !!actor && !!identity && !identity.getPrincipal().isAnonymous(),
  });

  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const dashboardPath =
    profile?.role === "lawyer" ? "/lawyer-dashboard" : "/dashboard";

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/lawyers", label: "Find a Lawyer" },
    { to: "/post-requirement", label: "Post Requirement" },
    { to: "/blog", label: "Legal Resources" },
    { to: "/about", label: "About" },
  ];

  return (
    <nav className="bg-[oklch(0.22_0.1_255)] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl"
            data-ocid="nav.home.link"
          >
            <Scale className="w-6 h-6 text-blue-300" />
            <span>LegalConnect</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm text-blue-100 hover:text-white transition-colors"
                data-ocid={`nav.${l.to.replace("/", "").replace(/-/g, "_") || "home"}.link`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link to={dashboardPath} data-ocid="nav.dashboard.link">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-100 hover:text-white hover:bg-blue-800"
                  >
                    <User className="w-4 h-4 mr-1" /> Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clear}
                  className="text-blue-100 hover:text-white hover:bg-blue-800"
                  data-ocid="nav.logout.button"
                >
                  <LogOut className="w-4 h-4 mr-1" /> Logout
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={login}
                disabled={isLoggingIn}
                className="bg-blue-500 hover:bg-blue-400 text-white"
                data-ocid="nav.login.button"
              >
                {isLoggingIn ? "Connecting..." : "Login / Sign Up"}
              </Button>
            )}
          </div>

          <button
            type="button"
            className="md:hidden text-blue-100"
            onClick={() => setOpen(!open)}
            data-ocid="nav.menu.toggle"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-[oklch(0.18_0.1_255)] px-4 pb-4 flex flex-col gap-3">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm text-blue-100 hover:text-white py-1"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <>
              <Link
                to={dashboardPath}
                onClick={() => setOpen(false)}
                className="text-sm text-blue-100 hover:text-white py-1"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  clear();
                  setOpen(false);
                }}
                className="text-sm text-blue-100 hover:text-white py-1 text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                login();
                setOpen(false);
              }}
              className="bg-blue-500 hover:bg-blue-400 text-white w-fit"
              data-ocid="nav.mobile.login.button"
            >
              Login / Sign Up
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}
