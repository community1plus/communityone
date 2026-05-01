// HeaderTopRow.jsx
import { useNavigate } from "react-router-dom";

import LocationDisplay from "./LocationDisplay";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";

export default function HeaderTopRow() {
  const navigate = useNavigate();

  return (
    <div className="header-row">
      <div className="header-left">
        { /*<img
          src="/logo/logo.png"
          alt="Logo"
          className="logo"
          onClick={() => navigate("/communityplus")}
        />*/ }

        <LocationDisplay />
      </div>

      <div className="header-center">
        <SearchBar />
      </div>

      <div className="header-right">
        <UserMenu />
      </div>
    </div>
  );
}