import React, { useState } from "react";
import { Login } from "./index";
import { OTPVerification } from "./OTPVerification";
import styles from "./login.module.css";

export const LoginWithSteps = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState<string>("");

  const handleLoginSuccess = (userEmail: string) => {
    setEmail(userEmail);
    setCurrentStep(2); // Move to Step 2
  };

  const handleOtpSuccess = (user: any) => {
    console.log("Login successful:", user);
    // Redirect or perform further actions
  };

  const handleOtpError = (errorMessage: string) => {
    console.error("OTP verification failed:", errorMessage);
  };

  console.log("currentStep", currentStep); // Debug log to verify step transition
  return (
    <div className={styles.container}>
      
      {currentStep === 1 && <Login onLoginSuccess={handleLoginSuccess} />}
      {currentStep === 2 && (
        <OTPVerification
          email={email}
          onSuccess={handleOtpSuccess}
          onError={handleOtpError}
        />
      )}
    </div>
  );
};
