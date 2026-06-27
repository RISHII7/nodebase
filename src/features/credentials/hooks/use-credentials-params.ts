import { useQueryStates } from "nuqs";
import { credentialsParams } from "@/features/credentials/params";

export const useCredentialsParams = () => {
  return useQueryStates(credentialsParams);
};
