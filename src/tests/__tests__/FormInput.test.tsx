import React from 'react';

import { render, screen } from '@testing-library/react';

import FormInput from '@/components/FormInput';

describe('FormInput', () => {
  const mockRegister = jest.fn();
  const mockErrors = {};

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

  it('calls register function with correct parameters', () => {
    render(
      <FormInput
        {...defaultProps}
        patternValue={/test/}
        patternMessage="Invalid pattern"
        minLengthValue={5}
        minLengthMessage="Too short"
        maxLengthValue={10}
        maxLengthMessage="Too long"
      />
    );
    expect(mockRegister).toHaveBeenCalledWith('testInput', {
      required: { value: true, message: 'This field is required' },
      pattern: { value: /test/, message: 'Invalid pattern' },
      minLength: { value: 5, message: 'Too short' },
      maxLength: { value: 10, message: 'Too long' },
    });
  });

  it('applies error styles when there is an error', () => {
    const errorsWithMessage = { testInput: { message: 'Error message' } };
    render(<FormInput {...defaultProps} errors={errorsWithMessage} />);
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500');
  });

  it('does not apply error styles when readOnly is true, even if there is an error', () => {
    const errorsWithMessage = { testInput: { message: 'Error message' } };
    render(<FormInput {...defaultProps} errors={errorsWithMessage} readOnly={true} />);
    expect(screen.getByRole('textbox')).not.toHaveClass('border-red-500');
  });
});
