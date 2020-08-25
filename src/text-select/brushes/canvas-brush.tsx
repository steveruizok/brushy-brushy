import * as React from "react";
import { useBrush } from "../hooks";

const Brush: React.FC<{}> = ({ children }) => {
  const rCanvas = React.useRef<HTMLCanvasElement>(null);

  useBrush({
    onUpdate: (brush) => {
      const cvs = rCanvas.current;
      const ctx = cvs?.getContext("2d");
      if (!(cvs && ctx)) return;

      if (brush) {
        const { x, y, width, height } = brush;

        ctx.resetTransform();
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        ctx.translate(0.5, 0.5);
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.globalAlpha = 0.2;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.stroke();
      } else {
        ctx.clearRect(0, 0, cvs.width, cvs.height);
      }
    },
    onResize: (size) => {
      const cvs = rCanvas.current;
      const ctx = cvs?.getContext("2d");
      if (!(cvs && ctx)) return;
      cvs.width = size.width;
      cvs.height = size.height;
      ctx.fillStyle = "rgba(0, 160, 255, 0.500)";
      ctx.strokeStyle = "#00a0ff";
    },
  });

  return (
    <canvas
      ref={rCanvas}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        pointerEvents: "none",
        imageRendering: "pixelated",
      }}
    />
  );
};

export default React.memo(Brush);
