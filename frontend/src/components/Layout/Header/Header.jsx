// Header.jsx
import "./Header.jsx";
import HeaderTopRow from "./HeaderTopRow";
import HeaderNav from "./HeaderNav";

export default function Header() {
  return (
    <header className="header">
      <HeaderTopRow />
      <HeaderNav />
    </header>
  );
}