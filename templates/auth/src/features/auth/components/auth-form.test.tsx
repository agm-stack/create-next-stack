import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import authMessages from "../../../../messages/en/auth.json";
import commonMessages from "../../../../messages/en/common.json";

const authMocks = vi.hoisted(() => ({
  signInWithGoogle: vi.fn(),
  signInWithMagicLink: vi.fn(),
  searchParams: new URLSearchParams(),
  toast: vi.fn(),
  verifyEmailCode: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => authMocks.searchParams,
}));

vi.mock("@/features/auth/api/mutations", () => ({
  useSignInWithGoogle: () => ({
    isPending: false,
    mutate: authMocks.signInWithGoogle,
  }),
  useSignInWithMagicLink: () => ({
    isPending: false,
    mutate: authMocks.signInWithMagicLink,
  }),
  useVerifyEmailCode: () => ({
    isPending: false,
    isSuccess: false,
    mutate: authMocks.verifyEmailCode,
  }),
}));

vi.mock("@/components/ui/toast", () => ({
  toastManager: {
    add: authMocks.toast,
  },
}));

import { AuthForm } from "./auth-form";

function renderAuthForm() {
  return render(
    <NextIntlClientProvider
      locale="en"
      messages={{
        auth: authMessages,
        common: commonMessages,
      }}
    >
      <AuthForm mode="sign-in" />
    </NextIntlClientProvider>,
  );
}

describe("auth form", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    authMocks.searchParams = new URLSearchParams();
  });

  it("shows a service error toast when email sign-in returns status 500", async () => {
    authMocks.signInWithMagicLink.mockImplementation((_payload, options) => {
      options.onError({
        isAxiosError: true,
        response: { status: 500 },
      });
    });

    renderAuthForm();

    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), {
      target: { value: "hello@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in with email" }));

    await waitFor(() => {
      expect(authMocks.toast).toHaveBeenCalledWith({
        description: "The service is temporarily unavailable. Please try again later.",
        title: "Authentication failed",
        type: "error",
      });
    });
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("offers the emailed code after sending the sign-in email", async () => {
    authMocks.signInWithMagicLink.mockImplementation((_payload, options) => {
      options.onSuccess();
    });

    renderAuthForm();

    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), {
      target: { value: "hello@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in with email" }));

    const firstSlot = await screen.findByLabelText("Sign-in code", { selector: "input" });

    fireEvent.change(firstSlot, { target: { value: "654321" } });

    expect(authMocks.verifyEmailCode).toHaveBeenCalledWith(
      { email: "hello@example.com", redirectTo: "/dashboard", token: "654321" },
      expect.any(Object),
    );
  });

  it("explains a sign-in link that failed in the callback", () => {
    authMocks.searchParams = new URLSearchParams("error=auth_callback");

    renderAuthForm();

    expect(screen.getByText("This sign-in link didn't work")).not.toBeNull();
  });

  it("shows no link warning on a normal visit", () => {
    renderAuthForm();

    expect(screen.queryByText("This sign-in link didn't work")).toBeNull();
  });
});
