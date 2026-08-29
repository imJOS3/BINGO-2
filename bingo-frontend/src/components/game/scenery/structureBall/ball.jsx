import BingoBall from "./BingoBall";

export default function Ball({ letter, number, size = "md", className = "" }) {
  return (
    <BingoBall
      letter={letter}
      number={number}
      size={size}
      className={className}
    />
  );
}
