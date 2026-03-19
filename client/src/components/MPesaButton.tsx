import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Phone, Loader2 } from "lucide-react";

interface MPesaButtonProps {
  amount: number;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
}

export default function MPesaButton({ amount, onSuccess, onError }: MPesaButtonProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleMPesaPayment = async () => {
    if (!phoneNumber.match(/^254\d{9}$/)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Kenyan phone number (254XXXXXXXXX)",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/payments/mpesa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          amount,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Payment Request Sent",
          description: "Please check your phone for the M-Pesa payment prompt",
        });
        
        // Simulate payment completion for demo
        setTimeout(() => {
          onSuccess(result.transactionId || `MPESA${Date.now()}`);
          setIsOpen(false);
          setPhoneNumber("");
        }, 3000);
      } else {
        onError(result.error || "M-Pesa payment failed");
      }
    } catch (error) {
      onError("Network error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
          <Phone className="w-4 h-4 mr-2" />
          Pay with M-Pesa (KSh {amount.toLocaleString()})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-green-600" />
            M-Pesa Payment
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="254712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              maxLength={12}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Enter your Safaricom number (254XXXXXXXXX)
            </p>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm">
              <strong>Amount:</strong> KSh {amount.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              You will receive a payment prompt on your phone
            </p>
          </div>
          <Button 
            onClick={handleMPesaPayment} 
            disabled={isProcessing || !phoneNumber}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Send Payment Request"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}