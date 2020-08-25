import * as React from "react";
import "./styles.css";
import TextContainer from "./text-select";
import BoxSelect from "./boxes";
import TextSelect from "./text-select";
import { without, range, uniqueId } from "lodash";

const ids = range(10).map((i) => uniqueId());

export default function App() {
  // const {
  //   selected,
  //   hasSelected,
  //   hasSelectedOne,
  //   hasSelectedAll,
  //   isSelecting,
  // } = useSelection();
  // const [items, setItems] = React.useState(ids);

  return (
    <div className="App">
      {/* <Container>
        {items.map((i) => (
          <Target key={i} id={i} isSelected={selected.includes(i)}>
            <h3>{i}</h3>
            <button onClick={() => setItems((items) => without(items, i))}>
              x
            </button>
          </Target>
        ))}
        <button onClick={() => setItems((items) => [...items, uniqueId()])}>
          Add Item
        </button>
      </Container> */}
      {/* {isSelecting && <h3>Selecting...</h3>}
      {hasSelectedAll ? (
        <h3>All items selected.</h3>
      ) : hasSelectedOne ? (
        <h3>One item selected.</h3>
      ) : hasSelected ? (
        <h3>{selected.length} items selected.</h3>
      ) : (
        <h3>No items selected.</h3>
      )} */}
      <BoxSelect />
      <TextSelect />
    </div>
  );
}
