import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useRequireAuth(redirectTo = '/') {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      navigate(redirectTo);
    }
  }, [navigate, redirectTo]);
}

export function useRedirectIfAuthenticated(redirectTo = '/main') {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('authToken')) {
      navigate(redirectTo);
    }
  }, [navigate, redirectTo]);
}
