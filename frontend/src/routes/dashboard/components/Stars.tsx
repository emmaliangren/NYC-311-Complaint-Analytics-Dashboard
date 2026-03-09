import { useMemo } from "react";

const Stars = () => {
  const stars = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.7 + 0.2,
        delay: `${Math.random() * 4}s`,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden text-indigo-500 dark:text-white">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full"
          style={{
            backgroundColor: "currentColor",
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animation: `twinkle 3s ease-in-out ${s.delay} infinite alternate`,
          }}
        />
      ))}
    </div>
  );
};

export default Stars;
