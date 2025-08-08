import { useEffect, useState } from "react";
import { useConfigStore } from "../stores/config.store";

const UrlRedirectDashboard = () => {
  const pages = useConfigStore((state) => state.pages);
  const setPages = useConfigStore((state) => state.setPages);

  const [activeTabUrl, setActiveTabUrl] = useState<URL | undefined>();
  const [destinationUrl, setDestinationUrl] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0]?.url;
      if (!activeTab) return;
      try {
        const url = new URL(activeTab);
        setActiveTabUrl(url);
      } catch (error) {
        setFeedback("Invalid tab URL.");
        console.error(error);
      }
    });
  }, []);

  // Find redirect for current host
  const currentRedirect = activeTabUrl ? pages.find((p) => p.title === activeTabUrl.host) : undefined;

  const addPage = () => {
    if (!activeTabUrl) {
      setFeedback("No active tab detected.");
      return;
    }
    if (!destinationUrl) {
      setFeedback("Please enter a destination URL.");
      return;
    }
    if (pages.some((p) => p.title === activeTabUrl.host)) {
      setFeedback("Redirect already exists for this host.");
      return;
    }
    setPages((prev) => [
      ...prev,
      {
        title: activeTabUrl.host,
        url: destinationUrl,
      },
    ]);
    setFeedback("Redirect added!");
    setDestinationUrl("");
  };

  const removePage = (pageToRemove: string) => {
    setPages((prev) => prev.filter((page) => page.url !== pageToRemove));
    setFeedback("Redirect removed.");
    setDestinationUrl("");
  };

  return (
    <>
      {activeTabUrl && (
        <p className="mb-2 text-gray-700">
          Current Host: <span className="font-mono">{activeTabUrl.host}</span>
        </p>
      )}
      {feedback && <div className="mb-2 text-sm text-blue-600">{feedback}</div>}
      {currentRedirect ? (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-green-700">Redirect configured:</span>
          <a
            href={currentRedirect.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-700"
          >
            {currentRedirect.url}
          </a>
          <button
            type="button"
            onClick={() => removePage(currentRedirect.url)}
            className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
            aria-label="Remove redirect"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="mb-2">
          <label htmlFor="destination-url" className="block mb-1">
            Destination URL
          </label>
          <input
            className="border border-gray-300 p-2 rounded w-full"
            id="destination-url"
            type="url"
            placeholder="Enter destination URL"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            autoFocus
          />
          <button
            type="button"
            onClick={addPage}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded w-full"
            aria-label="Add redirect"
          >
            Add Redirect
          </button>
        </div>
      )}
      {pages.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">All Redirects</h3>
          <ul className="list-disc">
            {pages.map((page) => (
              <li key={page.url} className="mb-1 flex items-center justify-between">
                <span className="font-mono text-sm">{page.title}</span>
                <a
                  href={page.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-700 ml-2"
                >
                  {page.url}
                </a>
                <button
                  type="button"
                  onClick={() => removePage(page.url)}
                  className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
                  aria-label={`Remove redirect for ${page.title}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default UrlRedirectDashboard;
