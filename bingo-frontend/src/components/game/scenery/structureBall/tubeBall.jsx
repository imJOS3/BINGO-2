export default function TubeBall({ tone = "bulb" }) {
  return (
    <div className={`ball-hopper__sheen ball-hopper__sheen--${tone}`} aria-hidden="true">
      {tone === "bulb" ? <span className="ball-hopper__sheen-top" /> : null}
      <span className="ball-hopper__sheen-left" />
    </div>
  );
}
