import Cookies from 'js-cookie';

import { useAuthStore } from '@/stores/authStore';

jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}));

const mockedCookies = Cookies as jest.Mocked<typeof Cookies>;
const mockedGet = mockedCookies.get as unknown as jest.Mock;

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: false,
      accessToken: null,
      expiresAt: null,
      user: null,
    });
    jest.clearAllMocks();
  });

  it('initializes from valid cookies', async () => {
    mockedGet.mockReturnValueOnce('token-1');
    mockedGet.mockReturnValueOnce(String(Date.now() + 60_000));

    await useAuthStore.getState().initializeAuth();

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().accessToken).toBe('token-1');
  });

  it('clears auth state when cookie expiry is invalid', async () => {
    mockedGet.mockReturnValueOnce('token-2');
    mockedGet.mockReturnValueOnce('not-a-number');

    await useAuthStore.getState().initializeAuth();

    expect(mockedCookies.remove).toHaveBeenCalledWith('auth_token', {
      sameSite: 'strict',
      secure: false,
    });
    expect(mockedCookies.remove).toHaveBeenCalledWith('expiresAt', {
      sameSite: 'strict',
      secure: false,
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
