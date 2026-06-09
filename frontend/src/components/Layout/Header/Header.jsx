import HeaderTopRow from "./HeaderTopRow";
import HeaderNav from "./HeaderNav";
import "./Header.css";

export default function Header({
  onOpenAuthModal,
}) {
  return (
    <header className="header">
      <HeaderTopRow
        onOpenAuthModal={
          onOpenAuthModal
        }
      />

      <HeaderNav />
    </header>
  );
}