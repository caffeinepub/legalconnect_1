import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogPostPage from "./pages/BlogPost";
import ClientDashboard from "./pages/ClientDashboard";
import Contact from "./pages/Contact";
import FindLawyer from "./pages/FindLawyer";
import Home from "./pages/Home";
import LawyerDashboard from "./pages/LawyerDashboard";
import LawyerProfile from "./pages/LawyerProfile";
import PostRequirement from "./pages/PostRequirement";

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});
const findLawyerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lawyers",
  component: FindLawyer,
});
const lawyerProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lawyers/$id",
  component: LawyerProfile,
});
const postRequirementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/post-requirement",
  component: PostRequirement,
});
const clientDashRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: ClientDashboard,
});
const lawyerDashRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lawyer-dashboard",
  component: LawyerDashboard,
});
const blogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog",
  component: Blog,
});
const blogPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog/$id",
  component: BlogPostPage,
});
const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: About,
});
const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: Contact,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  findLawyerRoute,
  lawyerProfileRoute,
  postRequirementRoute,
  clientDashRoute,
  lawyerDashRoute,
  blogRoute,
  blogPostRoute,
  aboutRoute,
  contactRoute,
]);

const router = createRouter({ routeTree, defaultPreload: "intent" });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
