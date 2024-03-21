import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import InputField from '../InputField';

describe('InputField Component', () => {
  test('renders input field with label', () => {
    render(
      <InputField
        id="test-input"
        name="testName"
        label="Test Label"
        value=""
        onChange={() => {}}
      />
    );

    // Check if the label is rendered
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();

    // Check if the input field is rendered
    expect(screen.getByRole('textbox', { name: 'Test Label' })).toBeInTheDocument();
  });

  test('displays error message when error prop is provided', () => {
    const errorMessage = 'Test error message';
    render(
      <InputField
        id="test-input"
        name="testName"
        label="Test Label"
        value=""
        onChange={() => {}}
        error={errorMessage}
      />
    );

    // Check if the error message is rendered
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('displays character count when characterCount prop is provided', () => {
    const maxLength = 10;
    const value = 'Test';
    render(
      <InputField
        id="test-input"
        name="testName"
        label="Test Label"
        value={value}
        onChange={() => {}}
        characterCount={true}
        maxLength={maxLength}
      />
    );

    // Check if the character count is displayed correctly
    const characterCountText = `Number of characters: ${value.length}/${maxLength}`;
    expect(screen.getByText(characterCountText)).toBeInTheDocument();
  });
});
