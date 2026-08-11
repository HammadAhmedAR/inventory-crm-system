import { useMutation, useQuery } from "@tanstack/react-query";

export function useAgreementOptions() {
  return useQuery({ queryKey: ["agreementOptions"], queryFn: window.api.agreements.getOptions });
}

export function useGenerateAgreementPdf() {
  return useMutation({ mutationFn: window.api.agreements.generatePdf });
}
