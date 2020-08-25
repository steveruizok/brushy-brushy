import * as React from "react";
import { useTarget } from "./hooks";

const TextTarget: React.FC<{ id: string; isSelected: boolean }> = ({
  id,
  isSelected,
  children,
}) => {
  const { ref, targetEvents } = useTarget<HTMLDivElement>(id);
  return (
    <span
      ref={ref}
      style={{
        padding: "2px 4px",
        userSelect: "none",
        borderRadius: 2,
        margin: 2,
        backgroundColor: isSelected
          ? "rgba(0, 160, 255, .2500)"
          : "transparent",
      }}
      {...targetEvents}
    >
      {children}
    </span>
  );
};

export default TextTarget;
