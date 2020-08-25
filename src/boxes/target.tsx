import * as React from "react";
import { useTarget } from "./hooks";
import { motion } from "framer-motion";

const Target: React.FC<{
  id: string;
  isSelecting: boolean;
  isSelected: boolean;
  onDelete: () => void;
}> = ({ id, isSelecting, isSelected, children, onDelete }) => {
  const { ref, targetEvents } = useTarget<HTMLDivElement>(id);
  return (
    <motion.div
      layoutId={id}
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
        userSelect: "none",
        outline: isSelected ? "2px solid #00a0ff" : "none",
      }}
      {...targetEvents}
    >
      {children}
      <div
        style={{
          display: "grid",
          height: "100%",
          width: "100%",
          padding: 8,
          borderRadius: 4,
          backgroundColor: "#fefefe",
          transition: "all .5s",
          boxShadow: isSelecting
            ? isSelected
              ? "0px 8px 12px rgba(0,0,0,.2)"
              : "0px 2px 6px rgba(0,0,0,.1)"
            : "0px 8px 12px rgba(0,0,0,.2)",
          gridTemplateRows: "60% 1fr auto",
          position: "relative",
        }}
      >
        <div
          style={{
            borderRadius: 2,
            transition: "all .5s",
            opacity: isSelecting ? (isSelected ? 1 : 0.5) : 1,
            backgroundSize: "cover",
            backgroundImage: `url(https://source.unsplash.com/collection/${id}/800x600)`,
          }}
        />
        <p style={{ margin: 0, marginTop: 16 }}>{id}</p>
        <button
          style={{
            all: "unset",
            borderRadius: 22,
            padding: 4,
            color: "#333",
            fontSize: 12,
            fontWeight: "bold",
          }}
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
};

export default Target;
