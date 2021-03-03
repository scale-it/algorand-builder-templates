/* global AlgoSigner */
import './signer.css';
import { LEDGER } from "../algosigner.config";
import {useState, useCallback} from "react";
import { Container, CssBaseline, Button, Typography } from '@material-ui/core'

const ExampleAlgoSigner = ({title, buttonText, buttonAction}) => {
  const [result, setResult] = useState("");

  const check = useCallback(async () => {
    const r = await buttonAction();
    setResult(r);
  }, [buttonAction]);

  return (
    <div className="algoSigner">
      <Typography variant="h5">
        {title}
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={check}
        style={{
          margin: '5px 0px 5px 0px'
        }}
      >
        {buttonText}
      </Button>

      <Typography>
        <code>
          {result}
        </code>
      </Typography>
    </div>
  );
};

const CheckAlgoSigner = () => {
  const action = useCallback(() => {
    if (typeof AlgoSigner !== 'undefined') {
      return "AlgoSigner is installed.";
    } else {
      return "AlgoSigner is NOT installed.";
    }
  }, []);

  return <ExampleAlgoSigner title="Check if algosigner is installed" buttonText="Check" buttonAction={action}/>
};

const Connect = () => {
  const action = useCallback(async () => {
    await AlgoSigner.connect({
      ledger: LEDGER
    });
  }, []);

  return <ExampleAlgoSigner title="Connect with Algosigner" buttonText="Connect" buttonAction={action}/>
};

const GetAccounts = () => {
  const action = useCallback(async () => {
    try {
      const accts = await AlgoSigner.accounts({
        ledger: LEDGER
      });
      return JSON.stringify(accts, null, 2);
    } catch (e) {
      return JSON.stringify(e.message, null, 12);
    }
  }, []);

  return <ExampleAlgoSigner title="Get Accounts" buttonText="Get Accounts" buttonAction={action}/>
};

const GetTxParams = () => {
  const action = useCallback(async () => {
    try {
      const r = await AlgoSigner.algod({
        ledger: LEDGER,
        path: `/v2/transactions/params`
      });
      return JSON.stringify(r, null, 2);
    } catch (e) {
      console.error(e);
      return JSON.stringify(e, null, 2);
    }
  }, []);

  return <ExampleAlgoSigner title="Get Transaction Params" buttonText="Get Tx Params" buttonAction={action}/>
};

export default function Signer() {
  return (
    <Container >
      <CssBaseline />
      <CheckAlgoSigner />
      <Connect />
      <GetAccounts />
      <GetTxParams />
    </Container>
  );
}