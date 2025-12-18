import { useEffect } from "react";

const GoogleLogin = () => {
  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id:
        "174260091142-p7obli121r5at2g9nv4d83l4hekfihf6.apps.googleusercontent.com",
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
