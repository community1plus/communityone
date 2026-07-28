import { WalletOverview } from "./WalletOverview";
import WalletAccounts from "./WalletAccounts";
import WalletTransactions from "./WalletTransactions";
import WalletSettings from "./WalletSettings";

export default function WalletSectionRenderer({ section }) {

    switch (section) {

        case "accounts":
            return <WalletAccounts />;

        case "transactions":
            return <WalletTransactions />;

        case "settings":
            return <WalletSettings />;

        default:
            return <WalletOverview />;

    }

}