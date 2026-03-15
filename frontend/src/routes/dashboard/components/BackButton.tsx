import { Link } from "react-router";
import Button from "@/components/ui/Button/Button";

const BackButton = () => (
  <Button aria-label="Go to home" variant="icon">
    <Link
      to="/"
      className="text-slate-400 hover:text-slate-900 transition-colors"
      aria-label="Back to home"
      style={{ fontSize: "2.5rem", lineHeight: 1 }}
    >
      ←
    </Link>
  </Button>
);

export default BackButton;
