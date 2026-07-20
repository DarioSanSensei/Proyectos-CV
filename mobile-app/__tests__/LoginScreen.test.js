import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../src/screens/LoginScreen';
import { AuthContext } from '../src/context/AuthContext';

// Mock navigation
const mockNavigation = { navigate: jest.fn() };

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Error: 'error', Success: 'success' },
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient'
}));

const mockLogin = jest.fn();

const renderWithAuth = (ui) => {
  return render(
    <AuthContext.Provider value={{ login: mockLogin }}>
      {ui}
    </AuthContext.Provider>
  );
};

describe('LoginScreen (Mobile App)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Debe renderizar la pantalla correctamente con los inputs', () => {
    const { getByPlaceholderText, getByText } = renderWithAuth(
      <LoginScreen navigation={mockNavigation} />
    );
    
    expect(getByText('CINESANZA')).toBeTruthy();
    expect(getByPlaceholderText('tu@correo.com')).toBeTruthy();
    expect(getByText(/ENTRAR AL CINE/i)).toBeTruthy();
  });

  it('Debe escribir en el input de correo', () => {
    const { getByPlaceholderText } = renderWithAuth(
      <LoginScreen navigation={mockNavigation} />
    );
    
    const emailInput = getByPlaceholderText('tu@correo.com');
    fireEvent.changeText(emailInput, 'test@cine.com');
    
    expect(emailInput.props.value).toBe('test@cine.com');
  });

  it('No debe llamar a login() si los campos están vacíos', () => {
    const { getByText } = renderWithAuth(
      <LoginScreen navigation={mockNavigation} />
    );
    
    const loginButton = getByText(/ENTRAR AL CINE/i);
    fireEvent.press(loginButton);
    
    expect(mockLogin).not.toHaveBeenCalled();
  });
});
