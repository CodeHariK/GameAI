// App.tsx
import { createSignal } from "solid-js";
import { FSM } from "../fsm/fsm";

type LightState = "RED" | "YELLOW" | "GREEN";
type LightEvent = "NEXT";

const trafficFSM = new FSM<LightState, LightEvent>({
  initial: "RED",
  states: [
    { id: "RED", transitions: [{ event: "NEXT", to: "GREEN" }] },
    { id: "GREEN", transitions: [{ event: "NEXT", to: "YELLOW" }] },
    { id: "YELLOW", transitions: [{ event: "NEXT", to: "RED" }] },
  ],
});

export default function TrafficLight() {
  // Use a signal to trigger Solid's reactivity
  const [state, setState] = createSignal(trafficFSM.currentStateID);

  const handleNext = () => {
    const success = trafficFSM.send("NEXT");
    if (success) setState(trafficFSM.currentStateID);
  };

  return (
    <div style={{ padding: "20px", "text-align": "center" }}>
      <h1>FSM Visualizer</h1>

      {/* The Visual Representation */}
      <div style={{
        background: "#333", width: "60px", padding: "10px",
        margin: "0 auto", "border-radius": "10px"
      }}>
        <LightCircle color="red" active={state() === "RED"} />
        <LightCircle color="yellow" active={state() === "YELLOW"} />
        <LightCircle color="green" active={state() === "GREEN"} />
      </div>

      <button onClick={handleNext} style={{ "margin-top": "20px" }}>
        Trigger "NEXT" Event
      </button>

      <p>Current State: <strong>{state()}</strong></p>
    </div>
  );
}

const LightCircle = (props: { color: string, active: boolean }) => (
  <div style={{
    width: "40px", height: "40px", "border-radius": "50%",
    margin: "10px auto",
    background: props.active ? props.color : "#111",
    border: "2px solid white",
    transition: "background 0.3s"
  }} />
);