import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import InputField from "../InputField";

describe("InputField Component", () => {
  test("renders input field with label", () => {
    render(<InputField label="Name" />);
    const inputElement = screen.getByLabelText(/name/i);
    expect(inputElement).toBeInTheDocument();
  });

  test("displays error message when error prop is provided", () => {
    render(<InputField label="Name" error="This field is required" />);
    const errorMessage = screen.getByText(/this field is required/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test("updates value when typed into input", () => {
    render(<InputField label="Name" />);
    const inputElement = screen.getByLabelText(/name/i);
    fireEvent.change(inputElement, { target: { value: "John Doe" } });
    expect(inputElement.value).toBe("John Doe");
  });

  test("displays character count when characterCount prop is true", () => {
    render(
      <InputField
        label="Name"
        characterCount={true}
        maxLength={10}
        value="John"
      />
    );
    const characterCountElement = screen.getByText(
      /number of characters: 4\/10/i
    );
    expect(characterCountElement).toBeInTheDocument();
  });
});
