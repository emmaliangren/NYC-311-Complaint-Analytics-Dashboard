import Button from "@/components/ui/Button";
import { Link } from "react-router";

const BackButton = () => (
  <Button aria-label="Go to home" variant="icon" title="Go Home">
    <Link
      to="/"
      className="text-slate-400 text-4xl leading-none hover:text-slate-900 transition-colors"
      aria-label="Back to home"
    >
      <span>←</span>
    </Link>
  </Button>
);

export default BackButton;
