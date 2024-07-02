import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { PiArrowRightBold } from "react-icons/pi";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";

const EmailInput = () => {
  // const { toast } = useToast();

  const [email, setEmail] = useState("");
  const handleEmailSubmission = async () => {
    const toastId = toast.loading("Please wait");
    const res = await fetch("/api/save-email.json", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.message.issues) {
        toast.error(data.message.issues[0].message, {
          id: toastId,
        });
        return;
      }
      toast.error("Something went wrong!", {
        id: toastId,
      });
      return;
    }
    toast.success("You will be notified", {
      id: toastId,
    });
    setEmail("");
  };
  return (
    <div className="bg-neutral-500/30 backdrop-blur-lg w-[32rem] mt-10 focus-within:ring-1 focus-within:ring-ring rounded-full pl-3 py-2 pr-2 flex items-center">
      <Input
        type="email"
        placeholder="yourpersonal@gmail.com"
        className="text-2xl "
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button
        onClick={handleEmailSubmission}
        className="font-bold  rounded-full p-3 h-fit w-fit"
        size={"icon"}
      >
        <PiArrowRightBold size={28} />
      </Button>
    </div>
  );
};

export default EmailInput;
