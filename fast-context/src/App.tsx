import "./App.css";
import createFastStore from "./fastContext";

type Store = { first: string; last: string };

const { Provider, useStore, useStoreReset } = createFastStore<Store>(
  { first: "", last: "" },
  "fastContext"
);

const TextInput = ({ value }: { value: "first" | "last" }) => {
  const [store, setStore] = useStore<string>((store) => store[value])!;
  return (
    <div className="field">
      {value}:{" "}
      <input
        value={store}
        onChange={(e) => setStore({ [value]: e.target.value })}
      />
    </div>
  );
};

const Display = ({ value }: { value: "first" | "last" }) => {
  const [store] = useStore((store) => store[value])!;
  return (
    <div className="value">
      {value}: {store}
    </div>
  );
};

const FormContainer = () => {
  return (
    <div className="container">
      <h5>FormContainer</h5>
      <TextInput value="first" />
      <TextInput value="last" />
    </div>
  );
};

const DisplayContainer = () => {
  return (
    <div className="container">
      <h5>DisplayContainer</h5>
      <Display value="first" />
      <Display value="last" />
    </div>
  );
};

const ContentContainer = () => {
  const reset = useStoreReset();
  return (
    <div className="container">
      <h5>ContentContainer</h5>
      <FormContainer />
      <DisplayContainer />
      <button
        onClick={() => {
          reset();
        }}
      >
        reset
      </button>
    </div>
  );
};

function App() {
  return (
    <Provider>
      <div className="container">
        <h5>App</h5>
        <ContentContainer />
      </div>
    </Provider>
  );
}

export default App;
