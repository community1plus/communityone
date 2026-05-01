import { useNavigate } from "react-router-dom";

import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu.jsx";

export default function HeaderTopRow() {
  const navigate = useNavigate();

  return (
    <div className="header-row">
      <div className="header-left">
        <div className="brand" onClick={() => navigate("/communityplus")}>
          <div className="brand-mark">
            <span className="brand-c"></span>
            <span className="brand-o"></span>
          </div>

          <div className="brand-wordmark">
            <span>COMMUNITY</span>
            <span>ONE</span>
          </div>
        </div>
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