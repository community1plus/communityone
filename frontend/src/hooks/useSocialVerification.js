import { useEffect } from "react";

import {
  useSearchParams,
} from "react-router-dom";

export default function useSocialVerification() {

  const [searchParams] =
    useSearchParams();

  const social =
    searchParams.get("social");

  const verified =
    searchParams.get("verified");

  useEffect(() => {

    console.log(
      "SOCIAL CALLBACK",
      {
        social,
        verified,
      }
    );

  }, [
    social,
    verified,
  ]);

}