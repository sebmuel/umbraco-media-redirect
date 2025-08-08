import UrlRedirectDashboard from "./components/url-redirect";
import { useConfigStore } from "./stores/config.store";

function App() {
  const hydrated = useConfigStore((state) => state.hydrated);

  if (!hydrated) {
    return (
      <>
        <h2>Loading...</h2>
      </>
    );
  }

  return (
    <div className="p-2 bg-gray-700 text-white w-100 max-w-[400px] mx-auto border-b-blue-500 border-b-2">
      <h2 className="text-2xl">Umbraco Media Redirect</h2>
      <p>Welcome to the Umbraco Media Redirect Dashboard!</p>
      <UrlRedirectDashboard />
    </div>
  );
}

export default App;
