import HeaderTopRow from "./HeaderTopRow";
import HeaderNav from "./HeaderNav";
import "./Header.css";

export default function Header() {
  return (
    <header className="header">
      <HeaderTopRow />
      <HeaderNav />
    </header>
  );
}