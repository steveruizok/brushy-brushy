import * as React from "react";
import { useBrush } from "../hooks";

const SVGBrush: React.FC<{}> = ({ children }) => {
  const { isBrushing, brush, size } = useBrush();

  return (
    <svg
      viewBox={`0 0 ${size.width} ${size.height}`}
      width={size.width}
      height={size.height}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        pointerEvents: "none",
      }}
    >
      {isBrushing && (
        <rect
          {...brush}
          fill="rgba(204, 231, 255, 0.500)"
          stroke="#00a0ff"
          strokeWidth="1"
        />
      )}
    </svg>
  );
};

export default React.memo(SVGBrush);
