import * as React from "react";
import { useSelection, useContainer } from "./hooks";
import TextTarget from "./text-target";
import { without } from "lodash";
import Brush from "./brushes/canvas-brush";

const TextContainer: React.FC<{}> = ({ children }) => {
  const { rContainer, rCanvas, containerEvents } = useContainer<
    HTMLDivElement
  >();
  const [items, setItems] = React.useState(
    lorem.map((word, i) => i.toString())
  );

  const {
    selected,
    hasSelected,
    hasSelectedOne,
    hasSelectedAll,
    isSelecting,
  } = useSelection();

  return (
    <div
      ref={rContainer}
      style={{
        position: "relative",
        maxWidth: "100%",
        padding: 100,
      }}
      {...containerEvents}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        {items.map((i) => (
          <TextTarget
            isSelected={selected.includes(i)}
            key={i}
            id={i.toString()}
          >
            {lorem[parseInt(i)]}
          </TextTarget>
        ))}
      </div>
      <div style={{ userSelect: "none" }}>
        {hasSelected && (
          <button
            onClick={() => {
              setItems((items) => without(items, ...selected));
            }}
          >
            Delete Selected
          </button>
        )}
        {isSelecting && <h3>Selecting...</h3>}
        {hasSelectedAll ? (
          <h3>All items selected.</h3>
        ) : hasSelectedOne ? (
          <h3>One item selected.</h3>
        ) : hasSelected ? (
          <h3>{selected.length} items selected.</h3>
        ) : (
          <h3>No items selected.</h3>
        )}
      </div>
      <Brush />
    </div>
  );
};

export default TextContainer;

const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.".split(
  " "
);
