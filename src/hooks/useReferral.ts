import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const useReferral = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const referralCode = searchParams.get("ref");
    
    if (referralCode) {
      // Store referral code in localStorage for later use during signup
      localStorage.setItem("referral_code", referralCode);
      console.log("Referral code captured:", referralCode);
    }
  }, [searchParams]);

  const getReferralCode = () => {
    return localStorage.getItem("referral_code");
  };

  const clearReferralCode = () => {
    localStorage.removeItem("referral_code");
  };

  return {
    getReferralCode,
    clearReferralCode,
  };
};
