import {
  cleanup,
  fireEvent,
  render,
  screen,
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
  toast: vi.fn(),
  verifyEmailCode: vi.fn(),
}));

vi.mock("@/features/auth/api/mutations", () => ({
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

import { EmailCodeForm } from "./email-code-form";

function renderForm() {
  return render(
    <NextIntlClientProvider locale="en" messages={{ auth: authMessages, common: commonMessages }}>
      <EmailCodeForm email="hello@example.com" redirectTo="/create" />
    </NextIntlClientProvider>,
  );
}

function getSlots() {
  return [
    screen.getByLabelText("Sign-in code", { selector: "input" }),
    ...[2, 3, 4, 5, 6].map((position) => screen.getByLabelText(`Digit ${position} of 6`)),
  ] as HTMLInputElement[];
}

describe("email code form", () => {
  afterEach(cleanup);

  it("shows one box per digit and waits for the full code", () => {
    renderForm();

    const slots = getSlots();
    fireEvent.change(slots[0], { target: { value: "12" } });

    expect(slots.map((slot) => slot.value).join("")).toBe("12");
    expect((screen.getByRole("button", { name: "Sign in with code" }) as HTMLButtonElement).disabled).toBe(true);
    expect(authMocks.verifyEmailCode).not.toHaveBeenCalled();
  });

  it("signs in as soon as the whole code is entered", () => {
    renderForm();

    const slots = getSlots();
    fireEvent.change(slots[0], { target: { value: "123456" } });

    expect(slots.map((slot) => slot.value)).toEqual(["1", "2", "3", "4", "5", "6"]);
    expect(authMocks.verifyEmailCode).toHaveBeenCalledTimes(1);
    expect(authMocks.verifyEmailCode).toHaveBeenCalledWith(
      { email: "hello@example.com", redirectTo: "/create", token: "123456" },
      expect.any(Object),
    );
  });

  it("clears the boxes and shows an error toast when the code is rejected", () => {
    authMocks.verifyEmailCode.mockImplementation((_payload, options) => {
      options.onError({ isAxiosError: true, response: { status: 403 } });
    });
    renderForm();

    const slots = getSlots();
    fireEvent.change(slots[0], { target: { value: "123456" } });

    expect(authMocks.toast).toHaveBeenCalledWith(expect.objectContaining({
      title: "That code didn't work",
      type: "error",
    }));
    expect(getSlots().map((slot) => slot.value).join("")).toBe("");
  });
});
