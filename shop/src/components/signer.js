/* global AlgoSigner */
import './signer.css';

import { Button, Container, CssBaseline, Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';
import { useCallback, useState } from 'react';

import { CHAIN_NAME } from '../algosigner.config';
import { PaymentWidget } from './payment-widget';

const ExampleAlgoSigner = ({ title, buttonText, buttonAction }) => {
  const [result, setResult] = useState('');

  const check = useCallback(async () => {
    const r = await buttonAction();
    setResult(r);
  }, [buttonAction]);

  return (
    <div className="algoSigner">
      <Typography variant="h5">{title}</Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={check}
        style={{
          margin: '5px 0px 5px 0px',
        }}
      >
        {buttonText}
      </Button>

      <Typography>
        <code>{result}</code>
      </Typography>
    </div>
  );
};

const Connect = () => {
  const action = useCallback(async () => {
    try {
      const response = await AlgoSigner.connect({
        ledger: CHAIN_NAME,
      });
      return JSON.stringify(response, null, 2);
    } catch (e) {
      return JSON.stringify(e.message, null, 12);
    }
  }, []);

  return (
    <ExampleAlgoSigner
      title="Connect with Algosigner"
      buttonText="Connect"
      buttonAction={action}
    />
  );
};

const Ticket = ({ title, buttonText, amount }) => {
  return (
    <div className="algoSigner">
      <Typography variant="h5">{title}</Typography>
      <PaymentWidget buttonText={buttonText} amount={amount} />
    </div>
  );
};

export default function Signer() {
  return (
    <Container>
      <CssBaseline />
      <Connect />
      <Ticket
        title="Queen concert ticket"
        buttonText="Buy (5 ALGO)"
        amount={5}
      />
      <Ticket
        title="Beyonce concert ticket"
        buttonText="Buy (10 ALGO)"
        amount={10}
      />
    </Container>
  );
}

ExampleAlgoSigner.propTypes = {
  title: PropTypes.string,
  buttonText: PropTypes.string,
  buttonAction: PropTypes.func,
};

ExampleAlgoSigner.defaultProps = {
  title: '',
  buttonText: '',
  buttonAction: null,
};

Ticket.propTypes = {
  title: PropTypes.string,
  buttonText: PropTypes.string,
  amount: PropTypes.number,
};

Ticket.defaultProps = {
  title: '',
  buttonText: '',
  amount: -1,
};
