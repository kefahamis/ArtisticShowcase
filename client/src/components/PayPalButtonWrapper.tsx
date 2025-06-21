import React, { useEffect, useState, useRef } from "react";

interface PayPalButtonWrapperProps {
  amount: string;
  currency: string;
  intent: string;
  onSuccess: (paymentId: string) => void;
}

export default function PayPalButtonWrapper({
  amount,
  currency,
  intent,
  onSuccess,
}: PayPalButtonWrapperProps) {
  const [sdkReady, setSdkReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const buttonsContainerRef = useRef<HTMLDivElement>(null);
  const buttonsInstance = useRef<any>(null);

  // Cleanup function to prevent memory leaks
  const cleanupPayPal = () => {
    if (buttonsInstance.current) {
      try {
        buttonsInstance.current.close();
      } catch (err) {
        console.warn("Error cleaning up PayPal buttons:", err);
      }
      buttonsInstance.current = null;
    }
    
    // Remove all PayPal iframes
    document.querySelectorAll('iframe[src*="paypal.com"]').forEach(iframe => {
      iframe.remove();
    });
  };

  useEffect(() => {
    // Check if SDK is already loaded correctly
    if (window.paypal?.Buttons) {
      setSdkReady(true);
      return;
    }

    // Clean up any existing script to prevent duplicates
    const existingScripts = document.querySelectorAll(
      'script[src^="https://www.paypal.com/sdk/js"], script[src^="https://www.sandbox.paypal.com/sdk/js"]'
    );
    existingScripts.forEach(script => {
      document.body.removeChild(script);
    });

    cleanupPayPal();

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${
      import.meta.env.PROD
        ? 'YOUR_LIVE_CLIENT_ID'
        : 'ATMsHu7tPo_ITSSp5SZ_nm-21wAx9kWXSiXYQUK2vb2tz7K8ZGZy_eKnEw3PcNifIMZlJZOO2kG03ba0'
    }&currency=${currency}&components=buttons,funding-eligibility&disable-funding=credit,card`;
    
    script.async = true;
    script.setAttribute("data-namespace", "paypal_sdk");

    script.onload = () => {
      if (window.paypal_sdk?.Buttons) {
        window.paypal = window.paypal_sdk; // Alias for compatibility
        setSdkReady(true);
        setLoadError(null);
      } else {
        setLoadError('PayPal Buttons component not available');
        console.error('PayPal SDK loaded but Buttons missing:', window.paypal_sdk);
      }
    };

    script.onerror = () => {
      setLoadError('Failed to load PayPal SDK');
    };

    document.body.appendChild(script);

    return () => {
      // Clean up script and buttons when component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      cleanupPayPal();
    };
  }, [currency]);

  useEffect(() => {
    if (!sdkReady || !buttonsContainerRef.current) return;

    cleanupPayPal(); // Clean up any existing buttons before creating new ones

    try {
      buttonsInstance.current = window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          tagline: false
        },
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: amount,
                currency_code: currency
              }
            }],
            intent: intent.toUpperCase()
          });
        },
        onApprove: async (data, actions) => {
          try {
            const details = await actions.order.capture();
            console.log('Payment completed:', details);
            onSuccess(details.id);
          } catch (err) {
            console.error("Payment capture failed", err);
          }
        },
        onError: (err) => {
          console.error("PayPal error", err);
          setLoadError(`Payment error: ${err.message || err}`);
        }
      });

      if (buttonsInstance.current.isEligible()) {
        buttonsInstance.current.render(buttonsContainerRef.current).catch((err: any) => {
          console.error("Failed to render PayPal buttons:", err);
          setLoadError('Failed to initialize payment options');
        });
      } else {
        setLoadError('PayPal payment method not available');
      }
    } catch (err) {
      console.error("PayPal buttons initialization failed", err);
      setLoadError(`Initialization failed: ${err.message || err}`);
    }
  }, [sdkReady, amount, currency, intent, onSuccess]);

  return (
    <div className="paypal-container">
      {loadError ? (
        <div className="error-message">
          Payment initialization failed. Please try again or use another method.
          <div className="error-detail">{loadError}</div>
        </div>
      ) : !sdkReady ? (
        <div className="loading-message">Loading payment options...</div>
      ) : (
        <div ref={buttonsContainerRef} id="paypal-button-container"></div>
      )}
    </div>
  );
}