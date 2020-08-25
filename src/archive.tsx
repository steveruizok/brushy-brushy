export const nnop = () => {};
// export function useSelectionContainer<T extends HTMLElement = HTMLDivElement>({
//   color = "#00a0ff",
// } = {}) {
//   const rCanvas = React.useRef<HTMLCanvasElement>(null);

//   const { ref: rContainer } = useResizeObserver<T>({
//     onResize: () => {
//       const width = rContainer.current?.offsetWidth || 0;
//       const height = rContainer.current?.offsetHeight || 0;

//       state.send("CHANGED_CONTAINER_SIZE", {
//         width,
//         height,
//       });

//       const cvs = rCanvas.current;
//       const ctx = cvs?.getContext("2d");
//       if (!(cvs && ctx)) return;

//       cvs.width = width;
//       cvs.height = height;

//       ctx.translate(0.5, 0.5);
//       ctx.fillStyle = color;
//       ctx.strokeStyle = color;
//     },
//   });

//   React.useEffect(() => {
//     return state.onUpdate(({ data, isIn }) => {
//       const cvs = rCanvas.current;
//       const ctx = cvs?.getContext("2d");
//       if (!(cvs && ctx)) return;

//       const { x, y, w, h } = data.brush;

//       ctx.clearRect(0, 0, cvs.width, cvs.height);

//       if (isIn("drawing")) {
//         ctx.beginPath();
//         ctx.rect(x, y, w, h);
//         ctx.globalAlpha = 0.2;
//         ctx.fill();
//         ctx.globalAlpha = 1;
//         ctx.stroke();
//       }
//     });
//   }, [rCanvas]);
