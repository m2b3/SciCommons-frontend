import React from 'react';

import { render, screen } from '@testing-library/react';
import { z } from 'zod';

import FormInput from '@/components/common/FormInput';

describe('FormInput', () => {
  const mockRegister = jest.fn();
  const mockErrors = {};

  /* Fixed by Codex on 2026-02-27
     Who: Codex
     What: Reset and stabilize register mock behavior per test case.
     Why: FormInput now always supplies a `validate` callback, and shared mock call history made assertions brittle.
     How: Clear mock calls before each test and return a realistic register field object shape. */
  beforeEach(() => {
    mockRegister.mockClear();
    mockRegister.mockReturnValue({
      name: 'testInput',
      onBlur: jest.fn(),
      onChange: jest.fn(),
      ref: jest.fn(),
    });
  });

  const defaultProps = {
    name: 'testInput',
    type: 'text',
    placeholder: 'Enter text',
    register: mockRegister,
    requiredMessage: 'This field is required',
    errors: mockErrors,
  };

  it('renders input field correctly', () => {
    render(<FormInput {...defaultProps} />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<FormInput {...defaultProps} label="Test Label" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders textarea when textArea prop is true', () => {
    render(<FormInput {...defaultProps} textArea={true} />);
    expect(screen.getByRole('textbox')).toHaveProperty('tagName', 'TEXTAREA');
  });

  it('applies readonly attribute when readOnly prop is true', () => {
    render(<FormInput {...defaultProps} readOnly={true} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
  });

  it('displays error message when there is an error', () => {
    const errorsWithMessage = { testInput: { message: 'Error message' } };
    render(<FormInput {...defaultProps} errors={errorsWithMessage} />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('calls register function with a zod schema', () => {
    const testSchema = z.string().min(5, "Too short");
    render(
      <FormInput
        {...defaultProps}
        schema={testSchema}
      />
    );
    expect(mockRegister).toHaveBeenCalledWith(
      'testInput',
      expect.objectContaining({
        required: { value: true, message: 'This field is required' },
        validate: expect.any(Function),
      })
    );
  });

  it('applies error styles when there is an error', () => {
    const errorsWithMessage = { testInput: { message: 'Error message' } };
    render(<FormInput {...defaultProps} errors={errorsWithMessage} />);
    expect(screen.getByRole('textbox')).toHaveClass('border-functional-red');
  });

  it('does not apply error styles when readOnly is true, even if there is an error', () => {
    const errorsWithMessage = { testInput: { message: 'Error message' } };
    render(<FormInput {...defaultProps} errors={errorsWithMessage} readOnly={true} />);
    expect(screen.getByRole('textbox')).not.toHaveClass('border-functional-red');
  });
});