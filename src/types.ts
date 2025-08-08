export type Config = {
  activated: boolean;
  currentTabUrl: string;
  pages: Array<Page>;
};

export type Page = {
  title: string;
  url: string;
};

export type ConfigStore = {
  toggleActivationAsync: () => Promise<boolean>;
  addPageAsync: (page: Page) => Promise<void>;
  removePageAsync: (page: Page) => Promise<void>;
};

export type ConfigState = {
  state: Config;
  version: number;
};
