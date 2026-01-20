import { useEffect } from "react";

const GoogleLogin = () => {
  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCallbackResponse,
    });

    google.accounts.id.renderButton(
      document.getElementById("googleBtn"),
      {
        theme: "outline",
        size: "large",
        text: "continue_with",
      }
    );
  }, []);

  const handleCallbackResponse = (response) => {
    console.log("Google JWT:", response.credential);
    localStorage.setItem("google_token", response.credential);
  };

  return <div id="googleBtn"></div>;
};

export default GoogleLogin;
