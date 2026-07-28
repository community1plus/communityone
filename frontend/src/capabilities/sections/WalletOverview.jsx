export default function WalletOverview() {

    return (

        <div className="wallet-overview">

            <section className="wallet-summary">

                <h2>Available Balance</h2>

                <div className="wallet-balance">

                    $0.00

                </div>

                <p className="wallet-status">
                    Your wallet is active and ready to use.
                </p>

            </section>

            <section className="wallet-accounts">

                <h2>Accounts</h2>

                <ul>

                    <li>Community Wallet</li>

                    <li>Rewards Wallet</li>

                    <li>Savings Wallet</li>

                </ul>

            </section>

            <section className="wallet-activity">

                <h2>Recent Activity</h2>

                <p>
                    No transactions have been recorded yet.
                </p>

            </section>

        </div>

    );

}