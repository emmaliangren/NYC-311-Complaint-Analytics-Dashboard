import type { EdgeFadeProps } from "@/types/ClusterMap";

const EdgeFade = ({ colour = "light" }: EdgeFadeProps) => (
  <div
    className="pointer-events-none absolute inset-0 rounded"
    style={{
      background: `
        linear-gradient(to bottom, ${colour} 0%, transparent 18%),
        linear-gradient(to top,    ${colour} 0%, transparent 18%),
        linear-gradient(to right,  ${colour} 0%, transparent 14%),
        linear-gradient(to left,   ${colour} 0%, transparent 14%)
      `,
    }}
  />
);

export default EdgeFade;
