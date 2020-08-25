import * as React from "react";
import { useSelection, useContainer } from "./hooks";
import Target from "./target";
import { range, uniqueId, without } from "lodash";
import Brush from "./brushes/canvas-brush";
import { AnimatePresence, AnimateSharedLayout, motion } from "framer-motion";

const TextContainer: React.FC<{}> = ({ children }) => {
  const { rContainer, rCanvas, containerEvents } = useContainer<
    HTMLDivElement
  >();
  const [items, setItems] = React.useState(range(10).map((i) => i.toString()));

  const {
    selected,
    hasSelected,
    hasSelectedOne,
    hasSelectedAll,
    isSelecting,
  } = useSelection();

  return (
    <div
      style={{
        fontSize: 20,
        padding: 16,
      }}
    >
      <div
        ref={rContainer}
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gridAutoRows: 220,
          gridGap: 16,
          margin: 32,
          padding: 16,
        }}
        {...containerEvents}
      >
        <AnimateSharedLayout>
          <AnimatePresence>
            {items.map((i) => (
              <Target
                key={i}
                id={i}
                isSelecting={isSelecting}
                isSelected={selected.includes(i)}
                onDelete={() => setItems((items) => without(items, i))}
              ></Target>
            ))}
            <motion.button
              layoutId={"addmore"}
              style={{
                all: "unset",
                borderRadius: 22,
                padding: 4,
                color: "#333",
                fontSize: 12,
                fontWeight: "bold",
                userSelect: "none",
              }}
              onClick={() => setItems((items) => [...items, uniqueId()])}
            >
              Add Item
            </motion.button>
          </AnimatePresence>
        </AnimateSharedLayout>
        <Brush />
      </div>
      <div
        style={{
          userSelect: "none",
          display: "grid",
          gridAutoColumns: "1fr",
          gridAutoFlow: "column",
          padding: 16,
          justifyContent: "space-between",
        }}
      >
        <div>
          {hasSelected && (
            <button
              style={{
                all: "unset",
                borderRadius: 22,
                padding: 4,
                color: "#333",
                fontWeight: "bold",
                userSelect: "none",
                cursor: "pointer",
              }}
              onClick={() => {
                setItems((items) => without(items, ...selected));
              }}
            >
              <p>Delete Selected</p>
            </button>
          )}
        </div>
        <div>{isSelecting && <p>Selecting...</p>}</div>
        <div>
          {hasSelectedAll ? (
            <p>All items selected.</p>
          ) : hasSelectedOne ? (
            <p>One item selected.</p>
          ) : hasSelected ? (
            <p>{selected.length} items selected.</p>
          ) : (
            <p>No items selected.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextContainer;
