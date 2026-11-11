import React, { useEffect, useRef, useState } from 'react';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ||
  '1034213506563-5tgoasb9p2eljhb5a18gq94fagnm9m95.apps.googleusercontent.com';

const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

export default function GoogleSignInButton({ onCredential, disabled = false }) {
  const containerRef = useRef(null);
  const callbackRef = useRef(onCredential);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    let cancelled = false;
    let pollTimer = null;

    const renderGoogleButton = () => {
      if (cancelled || !containerRef.current || !window.google?.accounts?.id) {
        return false;
      }
      try {
        containerRef.current.innerHTML = '';
        const measuredWidth = containerRef.current.offsetWidth || 340;
        const buttonWidth = Math.max(240, Math.min(400, measuredWidth));

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            if (response?.credential && callbackRef.current) {
              await callbackRef.current(response.credential);
            }
          },
        });

        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          logo_alignment: 'left',
          width: buttonWidth,
        });

        setStatus('ready');
        return true;
      } catch (err) {
        console.error('Google Sign-In initialization error:', err);
        setStatus('error');
        return false;
      }
    };

    if (!renderGoogleButton()) {
      let script = document.querySelector(`script[src="${GIS_SCRIPT_SRC}"]`);
      if (!script) {
        script = document.createElement('script');
        script.src = GIS_SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      const handleScriptError = () => {
        if (!cancelled) setStatus('error');
      };
      script.addEventListener('error', handleScriptError);

      let attempts = 0;
      pollTimer = setInterval(() => {
        attempts += 1;
        if (renderGoogleButton()) {
          clearInterval(pollTimer);
        } else if (attempts >= 40) {
          clearInterval(pollTimer);
          if (!cancelled) setStatus('error');
        }
      }, 150);

      return () => {
        cancelled = true;
        clearInterval(pollTimer);
        script.removeEventListener('error', handleScriptError);
      };
    }

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
    };
  }, []);

  return (
    <div className="w-full">
      <div
        className={`relative flex justify-center transition-opacity ${
          disabled ? 'opacity-60 pointer-events-none' : ''
        }`}
      >
        <div ref={containerRef} className="w-full flex justify-center min-h-[42px]" />
      </div>
      {status === 'loading' && (
        <p className="text-[11px] text-center text-slate-400 mt-1">Loading Google Sign-In...</p>
      )}
      {status === 'error' && (
        <p className="text-[11px] text-center text-rose-500 mt-1">
          Google Sign-In could not load. Please check your network or ad blocker.
        </p>
      )}
    </div>
  );
}
