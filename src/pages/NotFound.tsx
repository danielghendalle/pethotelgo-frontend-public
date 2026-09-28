import { Link, useLocation } from "react-router-dom";

const NotFound = () => {
  useLocation();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">
          Oops! Page not found
        </p>
        <Link
          to="/dashboard"
          className="text-primary underline hover:text-primary/90"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
