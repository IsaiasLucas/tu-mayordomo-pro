import { useState, useEffect } from 'react';
import { detectUserCountry, detectUserCountrySync } from '@/lib/countryDetection';
import { getTermsForCountry, FinancialTerms } from '@/lib/countryTerminology';

/**
 * Hook to get country-specific financial terminology
 * Uses country detection to determine the appropriate terms
 */
export function useCountryTerms(): {
  terms: FinancialTerms;
  countryCode: string;
  isLoading: boolean;
} {
  // Start with sync detection for immediate render
  const [countryCode, setCountryCode] = useState(() => detectUserCountrySync());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Attempt async detection (includes IP geolocation)
    detectUserCountry(true).then((detectedCountry) => {
      if (mounted) {
        setCountryCode(detectedCountry);
        setIsLoading(false);
      }
    }).catch(() => {
      if (mounted) {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return {
    terms: getTermsForCountry(countryCode),
    countryCode,
    isLoading,
  };
}

/**
 * Sync version for SSR or immediate use
 */
export function useCountryTermsSync(): FinancialTerms {
  const countryCode = detectUserCountrySync();
  return getTermsForCountry(countryCode);
}
