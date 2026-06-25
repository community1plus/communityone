import useSocialVerification
  from "../../hooks/useSocialVerification";



 export default function useSocialVerification() {

  console.log("HOOK ENTERED");

  const [searchParams] =
    useSearchParams();

  const social =
    searchParams.get("social");

  const verified =
    searchParams.get("verified");

  console.log(
    "PARAMS:",
    social,
    verified
  ); 
    console.log("SOCIAL HOOK MOUNTED");
    console.log("PROFILE SOCIAL SECTION LOADED");
    useSocialVerification();
}  