import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <button
      onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
    >
      Log Out
    </button>
  );
};

export default LogoutButton;
