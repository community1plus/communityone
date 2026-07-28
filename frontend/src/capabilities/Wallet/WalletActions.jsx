import Button from "../../components/UI/Button";

export default function WalletActions({

    onTransfer,
    onDeposit,
    onWithdraw,

}) {

    return (

        <>

            <Button
                fullWidth
                variant="primary"
                onClick={onTransfer}
            >
                Transfer
            </Button>

            <Button
                fullWidth
                variant="secondary"
                onClick={onDeposit}
            >
                Deposit
            </Button>

            <Button
                fullWidth
                variant="secondary"
                onClick={onWithdraw}
            >
                Withdraw
            </Button>

        </>

    );

}