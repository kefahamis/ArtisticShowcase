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
    script.src = `https://www.sandbox.paypal.com/sdk/js?client-id=${
      import.meta.env.PROD
        ? 'ATMsHu7tPo_ITSSp5SZ_nm-21wAx9kWXSiXYQUK2vb2tz7K8ZGZy_eKnEw3PcNifIMZlJZOO2kG03ba0'
        : 'ATMsHu7tPo_ITSSp5SZ_nm-21wAx9kWXSiXYQUK2vb2tz7K8ZGZy_eKnEw3PcNifIMZlJZOO2kG03ba0' // Sandbox client ID
    }&currency=${currency}&components=buttons,funding-eligibility&disable-funding=credit,card,venmo&commit=true&intent=${intent.toLowerCase()}`;
    
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
  }, [currency, intent]);

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
          tagline: false,
          height: 48
        },
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: amount,
                currency_code: currency,
                breakdown: {
                  item_total: {
                    value: amount,
                    currency_code: currency
                  }
                }
              },
              items: [{
                name: "Artwork Purchase",
                description: "Purchase from Art Gallery",
                quantity: "1",
                unit_amount: {
                  value: amount,
                  currency_code: currency
                }
              }]
            }],
            application_context: {
              shipping_preference: 'NO_SHIPPING'
            }
          });
        },
        onApprove: async (data, actions) => {
          try {
            const details = await actions.order.capture();
            console.log('Payment completed:', details);
            if (details.status === "COMPLETED") {
              onSuccess(details.id);
            } else {
              setLoadError(`Payment status: ${details.status}`);
            }
          } catch (err) {
            console.error("Payment capture failed", err);
            setLoadError(`Payment failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }
        },
        onError: (err) => {
          console.error("PayPal error", err);
          setLoadError(`Payment error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        },
        onCancel: (data) => {
          console.log("Payment cancelled", data);
          setLoadError('Payment was cancelled');
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
      setLoadError(`Initialization failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [sdkReady, amount, currency, intent, onSuccess]);

  return (
    <div className="paypal-container">
      {loadError ? (
        <div className="text-red-600 p-4 bg-red-50 rounded-md">
          <p className="font-medium">Payment initialization failed</p>
          <p className="text-sm mt-1">Please try again or use another method.</p>
          {loadError && <p className="text-xs mt-2">{loadError}</p>}
        </div>
      ) : !sdkReady ? (
        <div className="text-gray-600 p-4 bg-gray-50 rounded-md">
          Loading payment options...
        </div>
      ) : (
        <div ref={buttonsContainerRef} id="paypal-button-container"></div>
      )}
    </div>
  );
}