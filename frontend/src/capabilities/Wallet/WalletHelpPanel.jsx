export default function WalletHelpPanel({ section }) {

    switch (section) {

        case "accounts":

            return (
                <>
                    <h3>Accounts</h3>

                    <p>
                        Your wallet can contain multiple accounts for different
                        purposes such as community funds, rewards, savings, or
                        future financial services.
                    </p>
                </>
            );

        case "transactions":

            return (
                <>
                    <h3>Transactions</h3>

                    <p>
                        Every movement of value is recorded as a transaction,
                        providing a complete history of activity across all of
                        your wallet accounts.
                    </p>
                </>
            );

        case "settings":

            return (
                <>
                    <h3>Settings</h3>

                    <p>
                        Configure wallet preferences, notifications, security,
                        and future payment options from this section.
                    </p>
                </>
            );

        default:

            return (
                <>
                    <h3>Wallet Overview</h3>

                    <p>
                        Your Wallet is your financial identity within the
                        Community One platform.
                    </p>

                    <p>
                        It provides a secure place to manage balances,
                        transactions, rewards, and future community financial
                        services.
                    </p>

                    <p>
                        As new capabilities are introduced, your Wallet will
                        become the central hub for payments, transfers, digital
                        assets, and community value exchange.
                    </p>
                </>
            );

    }

}