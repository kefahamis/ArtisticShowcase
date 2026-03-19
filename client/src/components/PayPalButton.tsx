
import React, { useEffect } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "paypal-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

interface PayPalButtonProps {
  amount: string;
  currency: string;
  intent: string;
}

export default function PayPalButton({
  amount,
  currency,
  intent,
}: PayPalButtonProps) {
  const createOrder = async () => {
    const orderPayload = {
      amount: amount,
      currency: currency,
      intent: intent,
    };
    const response = await fetch("/paypal/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });
    const output = await response.json();
    return { orderId: output.id };
  };

  const captureOrder = async (orderId: string) => {
    const response = await fetch(`/paypal/order/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    return data;
  };

  const onApprove = async (data: any) => {
    console.log("onApprove", data);
    const orderData = await captureOrder(data.orderId);
    console.log("Capture result", orderData);
  };

  const onCancel = async (data: any) => {
    console.log("onCancel", data);
  };

  const onError = async (data: any) => {
    console.log("onError", data);
  };

  useEffect(() => {
    const loadPayPalSDK = async () => {
      try {
        if (!(window as any).paypal) {
          const script = document.createElement("script");
          script.src = import.meta.env.PROD
            ? "https://www.paypal.com/sdk/js?client-id=YOUR_LIVE_CLIENT_ID&components=buttons,payment-fields"
            : "https://www.paypal.com/sdk/js?client-id=ATMsHu7tPo_ITSSp5SZ_nm-21wAx9kWXSiXYQUK2vb2tz7K8ZGZy_eKnEw3PcNifIMZlJZOO2kG03ba0&components=buttons,payment-fields";
          script.async = true;
          
          await new Promise((resolve, reject) => {
            script.onload = () => {
              if ((window as any).paypal?.createInstance) {
                console.log('PayPal SDK successfully loaded with createInstance');
                resolve(true);
              } else {
                reject(new Error('PayPal SDK loaded but createInstance missing'));
              }
            };
            script.onerror = () => {
              reject(new Error('Failed to load PayPal SDK script'));
            };
            document.body.appendChild(script);
          });
        }
        
        console.log('PayPal object exists:', !!(window as any).paypal);
        console.log('PayPal methods:', Object.keys((window as any).paypal || {}));
        await initPayPal();
      } catch (e) {
        console.error("PayPal SDK initialization failed:", e);
      }
    };
  
    loadPayPalSDK();
  }, []);
  
  const initPayPal = async () => {
    try {
      const clientToken: string = await fetch("/paypal/setup")
        .then((res) => res.json())
        .then((data) => {
          return data.clientToken;
        });
      
      console.log("PayPal object:", (window as any).paypal);
      console.log("createInstance exists:", typeof (window as any).paypal?.createInstance);
      console.log("Client token:", clientToken);
  
      const sdkInstance = await (window as any).paypal.createInstance({
        clientToken,
        components: ["payment-fields"]  // Changed from "paypal-fields" to "payment-fields"
      });
  
      const paypalCheckout = sdkInstance.createPayPalOneTimePaymentSession({
        onApprove,
        onCancel,
        onError,
      });
  
      const onClick = async () => {
        try {
          const checkoutOptionsPromise = createOrder();
          await paypalCheckout.start(
            { paymentFlow: "auto" },
            checkoutOptionsPromise,
          );
        } catch (e) {
          console.error("PayPal checkout error:", e);
        }
      };
  
      const paypalButton = document.getElementById("paypal-button");
      if (paypalButton) {
        paypalButton.addEventListener("click", onClick);
      }
  
      return () => {
        if (paypalButton) {
          paypalButton.removeEventListener("click", onClick);
        }
      };
    } catch (e) {
      console.error("PayPal initialization error:", e);
    }
  };

  return <paypal-button id="paypal-button"></paypal-button>;
}
