import * as React from "react";
import { createState, useStateDesigner } from "@state-designer/react";
import useResizeObserver from "use-resize-observer";

interface IRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// This uses two state machines: `simpleState` and `state`.

// Simple State:
// A simplified state to keep track of selected items, the
// selection state (none, one, some, or all) and the brush
// state (idle or selecting). This updates only when needed.

// State:
// A more complex state that tracks selected items, previously
// selected items, and uses UI events to move between states.
// It also keeps track of the brush.

export default function createBrushHooks() {
  const simpleState = createState({
    data: {
      selected: [] as string[],
      total: 0,
    },
    on: {
      CHANGED_TOTAL: "setTotal",
    },
    states: {
      selection: {
        on: {
          CHANGED_SELECTION: [
            "setTotal",
            "setSelected",
            {
              if: "selectedIsEmpty",
              to: "none",
            },
            {
              if: "selectedIsOne",
              to: "one",
            },
            {
              if: "selectedIsAll",
              to: "all",
            },
            {
              to: "some",
            },
          ],
        },
        initial: "none",
        states: {
          none: {},
          one: {},
          some: {},
          all: {},
        },
      },
      activity: {
        on: {
          STARTED_SELECTING: { to: "selecting" },
          STOPPED_SELECTING: { to: "idle" },
        },
        initial: "idle",
        states: {
          idle: {},
          selecting: {},
        },
      },
    },
    conditions: {
      selectedIsEmpty(data, { selected }) {
        return selected.length === 0;
      },
      selectedIsOne(data, { selected }) {
        return selected.length === 1;
      },
      selectedIsAll(data, { selected }) {
        return selected.length === data.total;
      },
    },
    actions: {
      setSelected(data, { selected }) {
        data.selected = selected;
      },
      setTotal(data, { total }) {
        data.total = total;
      },
    },
  });

  const state = createState({
    data: {
      canvas: undefined as React.RefObject<HTMLCanvasElement> | undefined,
      container: undefined as React.RefObject<HTMLElement> | undefined,
      targets: new Map<string, React.RefObject<HTMLElement>>([]),
      rects: new Map<string, IRect>([]),
      selected: new Set<string>([]),
      priorSelection: new Set<string>([]),
      origin: { x: 0, y: 0 },
      point: { x: 0, y: 0 },
      size: { w: 0, h: 0 },
      brush: { x: 0, y: 0, w: 0, h: 0 },
      offset: { x: 0, y: 0 },
      scroll: { x: 0, y: 0 },
    },
    on: {
      MOUNTED_TARGET: "addTarget",
      UNMOUNTED_TARGET: "removeTarget",
      CHANGED_CONTAINER_SIZE: {
        do: ["setContainerSize", "setOffset", "setScroll", "setTargetRects"],
      },
    },
    initial: "mounting",
    states: {
      mounting: {
        on: {
          MOUNTED_CONTAINER: {
            do: ["setContainer", "setContainerSize", "setOffset"],
            to: "idle",
          },
        },
      },
      idle: {
        onEnter: "clearBrush",
        on: {
          UNMOUNTED_CONTAINER: {
            do: "removeContainer",
            to: "mounting",
          },
          DOWNED_POINTER: ["setOrigin", "setPoint", { to: "maybeDrawing" }],
        },
      },
      maybeDrawing: {
        onEnter: "setPriorSelection",
        on: {
          MOVED_POINTER: [
            "setPoint",
            "setScroll",
            {
              if: "pointerDistanceIsEnough",
              do: ["setBrush", "setTargetRects"],
              to: "drawing",
            },
          ],
          CLICKED_CONTAINER: [
            {
              unless: "isShifted",
              do: "clearSelected",
            },
            { to: "idle" },
          ],
          CLICKED_TARGET: [
            {
              unless: "isShifted",
              do: "clearSelected",
            },
            "selectTarget",
            "notifySimpleOfSelectionChange",
            { to: "idle" },
          ],
        },
      },
      drawing: {
        onEnter: "notifySimpleOfSelectingStart",
        onExit: "notifySimpleOfSelectingEnd",
        on: {
          MOVED_POINTER: {
            do: ["setPoint", "setScroll", "setBrush", "setSelectedTargets"],
          },
          CHANGED_CONTAINER_SIZE: {
            do: ["setPoint", "setScroll", "setBrush", "setSelectedTargets"],
          },
          RAISED_POINTER: {
            to: "idle",
          },
          CLICKED_SOAK: {
            to: "idle",
          },
          CLICKED_TARGET: {
            to: "idle",
          },
        },
      },
      endingDrawing: {},
    },
    conditions: {
      isShifted(data, { shiftKey }) {
        return shiftKey;
      },
      pointerDistanceIsEnough(data) {
        const dist = getDistance(
          data.origin.x,
          data.origin.y,
          data.point.x,
          data.point.y
        );
        return Math.abs(dist) > 32;
      },
    },
    actions: {
      clearBrush(data) {
        data.brush = { x: 0, y: 0, w: 0, h: 0 };
      },
      addTarget(data, { id, ref }) {
        data.targets.set(id, ref);
        simpleState.send("CHANGED_TOTAL", { total: data.targets.size });
      },
      removeTarget(data, { id }) {
        if (data.targets.has(id)) {
          data.targets.delete(id);
        }

        if (data.selected.has(id)) {
          data.selected.delete(id);

          simpleState.send("CHANGED_SELECTION", {
            selected: Array.from(data.selected.values()),
            total: data.targets.size,
          });
        } else {
          simpleState.send("CHANGED_TOTAL", { total: data.targets.size });
        }
      },
      setContainer(data, { ref }) {
        data.container = ref;
      },
      setOffset(data, { scrollX, scrollY }) {
        const current = data.container?.current;
        if (!current) return;
        const rect = current.getBoundingClientRect();
        const margin = current.style.getPropertyValue("padding");
        console.log(margin);

        data.offset = {
          x: rect.x + scrollX,
          y: rect.y + scrollY,
        };
      },
      setScroll(data, { scrollX, scrollY }) {
        data.scroll = {
          x: scrollX,
          y: scrollY,
        };
      },
      setContainerSize(data, { width, height }) {
        data.size = { w: width, h: height };
      },
      removeContainer(data) {
        data.container = undefined;
      },
      setOrigin(data, { x, y, scrollX, scrollY }) {
        data.origin = {
          x: Math.round(x) - data.offset.x,
          y: Math.round(y) - data.offset.y,
        };
      },
      setPoint(data, { x, y, scrollX, scrollY }) {
        data.point = {
          x: Math.round(x) - data.offset.x,
          y: Math.round(y) - data.offset.y,
        };
      },
      selectTarget(data, { id }) {
        data.selected.add(id);
        simpleState.send("CHANGED_SELECTION", {
          selected: Array.from(data.selected.values()),
          total: data.targets.size,
        });
      },
      setBrush(data) {
        let x = Math.min(data.origin.x, data.point.x);
        let y = Math.min(data.origin.y, data.point.y);
        let w = Math.abs(data.origin.x - data.point.x);
        let h = Math.abs(data.origin.y - data.point.y);

        // Ensure that the box stays within the size of the container
        const mx = Math.max(data.origin.x, data.point.x);
        const my = Math.max(data.origin.y, data.point.y);

        if (x < 0) {
          w += x;
          x = 0;
        } else if (mx >= data.size.w) {
          w += data.size.w - mx - 1;
        }

        if (y < 0) {
          h += y;
          y = 0;
        } else if (my >= data.size.h) {
          h += data.size.h - my - 1;
        }

        data.brush = {
          x,
          y,
          w,
          h,
        };
      },
      setTargetRects(data, { scrollX, scrollY }) {
        Array.from(data.targets).forEach(([id, ref]) => {
          const el = ref.current;
          if (!el) return;

          const rect = el.getClientRects()[0];

          data.rects.set(id, {
            x: rect.x + data.scroll.x,
            y: rect.y + data.scroll.y,
            w: rect.width,
            h: rect.height,
          });
        });
      },
      clearSelected(data) {
        data.priorSelection.clear();
        data.selected.clear();

        simpleState.send("CHANGED_SELECTION", {
          selected: Array.from(data.selected.values()),
          total: data.targets.size,
        });
      },
      setPriorSelection(data) {
        data.selected.forEach((id) => data.priorSelection.add(id));
      },
      setSelectedTargets(data, { scrollX, scrollY, shiftKey }) {
        const { x, y, w, h } = data.brush;

        let didChange = false;

        Array.from(data.rects).forEach(([id, rect]) => {
          const isColliding = rectsCollide(
            rect.x + -data.offset.x,
            rect.y + -data.offset.y,
            rect.w,
            rect.h,
            x,
            y,
            w,
            h
          );

          if (!data.selected.has(id) && isColliding) {
            data.selected.add(id);
            didChange = true;
          } else if (data.selected.has(id) && !isColliding) {
            if (shiftKey && data.priorSelection.has(id)) return;
            data.selected.delete(id);
            didChange = true;
          }
        });

        if (didChange) {
          simpleState.send("CHANGED_SELECTION", {
            selected: Array.from(data.selected.values()),
            total: data.targets.size,
          });
        }
      },
      // Simple State
      notifySimpleOfSelectingStart() {
        simpleState.send("STARTED_SELECTING");
      },
      notifySimpleOfSelectingEnd() {
        simpleState.send("STOPPED_SELECTING");
      },
      notifySimpleOfSelectionChange(data) {
        simpleState.send("CHANGED_SELECTION", {
          selected: Array.from(data.selected.values()),
          total: data.targets.size,
        });
      },
    },
  });

  type Size = { width: number; height: number };
  type Rect = { x: number; y: number; width: number; height: number };

  type ResizeCallback = (size: Size) => void;
  type BrushCallback = (brush: Rect | undefined) => void;

  type BrushOptions = {
    onUpdate?: BrushCallback;
    onResize?: ResizeCallback;
  };

  function useBrush(options = {} as BrushOptions) {
    const _isBrushing = React.useRef(false);
    const _size = React.useRef({ h: 0, w: 0 });
    const _options = React.useMemo(() => options, []);

    const [isBrushing, setIsBrushing] = React.useState(false);
    const [brush, setBrush] = React.useState<undefined | Rect>(undefined);
    const [size, setSize] = React.useState<Size>({ width: 0, height: 0 });

    const handleUpdate = React.useCallback(
      ({ data, isIn }) => {
        const { x, y, w, h } = data.brush;
        const { size } = data;

        if (size.w !== _size.current.w || size.h !== _size.current.h) {
          if (!!_options.onResize) {
            _options.onResize({ width: size.w, height: size.h });
          } else {
            setSize({ width: size.w, height: size.h });
          }
          _size.current = size;
        }

        if (isIn("drawing")) {
          if (!!_options.onUpdate) {
            _options.onUpdate({ x, y, width: w, height: h });
          } else {
            if (!_isBrushing.current) {
              setIsBrushing(true);
              _isBrushing.current = true;
            }

            setBrush({ x, y, width: w, height: h });
          }
        } else if (!isIn("drawing")) {
          if (!!_options.onUpdate) {
            _options.onUpdate(undefined);
          } else {
            if (_isBrushing.current) {
              setIsBrushing(false);
              _isBrushing.current = false;
            }

            setBrush(undefined);
          }
        }
      },
      [state]
    );

    state.onUpdate(handleUpdate);

    React.useEffect(() => {
      state.getUpdate(handleUpdate);
    }, [state]);

    return { isBrushing, brush, size };
  }

  function useContainer<T extends HTMLElement = HTMLDivElement>() {
    const rCanvas = React.useRef<HTMLCanvasElement>(null);

    const { ref: rContainer } = useResizeObserver<T>({
      onResize: () => {
        const width = rContainer.current?.offsetWidth || 0;
        const height = rContainer.current?.offsetHeight || 0;

        state.send("CHANGED_CONTAINER_SIZE", {
          width,
          height,
          scrollX: window.scrollX,
          scrollY: window.scrollY,
        });
      },
    });

    React.useEffect(() => {
      if (rContainer?.current)
        state.send("MOUNTED_CONTAINER", {
          ref: rContainer,
          scrollX: window.scrollX,
          scrollY: window.scrollY,
        });

      return () => {
        state.send("UNMOUNTED_CONTAINER", {
          ref: rContainer,
          scrollX: window.scrollX,
          scrollY: window.scrollY,
        });
      };
    }, [rContainer, rCanvas]);

    const containerEvents = React.useMemo(() => {
      function handleUp(e: PointerEvent) {
        e.stopPropagation();
        state.send("RAISED_POINTER", {
          x: e.pageX,
          y: e.pageY,
          shiftKey: e.shiftKey,
          scrollX: window.scrollX,
          scrollY: window.scrollY,
        });
        window.removeEventListener("pointerup", handleUp);
        window.removeEventListener("pointermove", handleMove);
      }

      function handleMove(e: PointerEvent) {
        e.stopPropagation();
        state.send("MOVED_POINTER", {
          x: e.pageX,
          y: e.pageY,
          shiftKey: e.shiftKey,
          scrollX: window.scrollX,
          scrollY: window.scrollY,
        });
      }

      return {
        onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
          e.stopPropagation();
          state.send("DOWNED_POINTER", {
            x: e.pageX,
            y: e.pageY,
            shiftKey: e.shiftKey,
            scrollX: window.scrollX,
            scrollY: window.scrollY,
          });
          window.addEventListener("pointermove", handleMove);
          window.addEventListener("pointerup", handleUp);
        },
        // onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
        //   e.stopPropagation();
        //   state.send("MOVED_POINTER", {
        //     x: e.pageX,
        //     y: e.pageY,
        //     shiftKey: e.shiftKey,
        //     scrollX: window.scrollX,
        //     scrollY: window.scrollY,
        //   });
        // },
        onClick: (e: React.PointerEvent<HTMLDivElement>) => {
          e.stopPropagation();
          state.send("CLICKED_CONTAINER", { shiftKey: e.shiftKey });
        },
      };
    }, [rContainer]);

    const soakEvents = React.useMemo(() => {
      return {
        onClick: (e: React.PointerEvent<HTMLDivElement>) => {
          e.stopPropagation();
          state.send("CLICKED_SOAK");
        },
      };
    }, [rContainer]);

    return { rContainer, rCanvas, containerEvents, soakEvents };
  }

  function useTarget<T extends HTMLElement = HTMLDivElement>(id: string) {
    const _id = React.useMemo(() => id, []);
    const ref = React.useRef<T>(null);

    React.useEffect(() => {
      if (ref.current) state.send("MOUNTED_TARGET", { id: _id, ref });
      return () => {
        state.send("UNMOUNTED_TARGET", { id: _id, ref });
      };
    }, [ref]);

    const targetEvents = React.useMemo(() => {
      return {
        onClick: (e: React.PointerEvent<HTMLDivElement>) => {
          e.stopPropagation();
          state.send("CLICKED_TARGET", { id: _id, shiftKey: e.shiftKey });
        },
      };
    }, []);

    return { ref, targetEvents };
  }

  function useSelection() {
    const local = useStateDesigner(simpleState);

    return {
      selected: local.data.selected,
      total: local.data.total,
      isSelecting: local.isIn("selecting"),
      hasSelected: !local.isIn("none"),
      hasSelectedOne: local.isIn("one"),
      hasSelectedAll: local.isIn("all"),
    };
  }

  return { useBrush, useContainer, useTarget, useSelection };
}

// Helpers

export function rectsCollide(
  x0: number,
  y0: number,
  w0: number,
  h0: number,
  x1: number,
  y1: number,
  w1: number,
  h1: number
) {
  return !(x0 >= x1 + w1 || x1 >= x0 + w0 || y0 >= y1 + h1 || y1 >= y0 + h0);
}

export function getDistance(x0: number, y0: number, x1: number, y1: number) {
  return Math.hypot(y1 - y0, x1 - x0);
}
