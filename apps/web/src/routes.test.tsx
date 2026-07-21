// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router";
import { routes } from "./generated-routes";

vi.mock("./features/notes/NotesPage", () => ({
  NotesPage: () => <div data-testid="notes-page" />,
}));
vi.mock("./features/assistant/AssistantChatPage", () => ({
  AssistantChatPage: () => <div data-testid="chat-page" />,
}));
vi.mock("./features/settings/SettingsPage", () => ({
  SettingsPage: () => <div data-testid="settings-page" />,
}));
vi.mock("./features/logs/LogsPage", () => ({
  LogsPage: () => <div data-testid="logs-page" />,
}));

function renderRoute(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
}

afterEach(() => {
  cleanup();
});

describe("route table", () => {
  it("renders notes at the index route", async () => {
    renderRoute("/");
    expect(await screen.findByTestId("notes-page")).toBeTruthy();
  });

  it("renders the chat page at /chat", async () => {
    renderRoute("/chat");
    expect(await screen.findByTestId("chat-page")).toBeTruthy();
  });

  it("renders the settings page at /settings", async () => {
    renderRoute("/settings");
    expect(await screen.findByTestId("settings-page")).toBeTruthy();
  });

  it("renders the logs page at /logs", async () => {
    renderRoute("/logs");
    expect(await screen.findByTestId("logs-page")).toBeTruthy();
  });
});

describe("unknown route falls back to notes", () => {
  it("renders notes for an unmatched multi-segment path", async () => {
    renderRoute("/no/such/place");
    expect(await screen.findByTestId("notes-page")).toBeTruthy();
  });
});
