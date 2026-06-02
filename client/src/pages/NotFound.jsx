import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-12 text-center">
      <div>
        <p className="text-8xl font-black text-primary">404</p>
        <h1 className="mt-4 text-3xl font-black">Page not found</h1>
        <p className="mt-2 text-slate-500">The page you are looking for does not exist.</p>
        <Link className="btn-primary mt-8" to="/">Go home</Link>
      </div>
    </div>
  );
}
