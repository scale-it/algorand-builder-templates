/* global AlgoSigner */
import './signer.css';

import {
  Button,
  CircularProgress,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Typography,
} from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import MuiAlert from '@material-ui/lab/Alert';
import { isValidAddress } from 'algosdk';
import PropTypes from 'prop-types';
import React from 'react';
import { useCallback, useState } from 'react';

import * as Gold from '../../artifacts/scripts/0-gold-asa.js.cp.yaml';
import * as Tesla from '../../artifacts/scripts/1-tesla-asa.js.cp.yaml';
import { CHAIN_NAME } from '../algosigner.config';
import transferASA from './transfer-asa';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

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

const CheckAlgoSigner = () => {
  const action = useCallback(() => {
    if (typeof AlgoSigner !== 'undefined') {
      return 'AlgoSigner is installed.';
    }
    return 'AlgoSigner is NOT installed.';
  }, []);

  return (
    <ExampleAlgoSigner
      title="Check if algosigner is installed"
      buttonText="Check"
      buttonAction={action}
    />
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

const GetAccounts = () => {
  const action = useCallback(async () => {
    try {
      const accts = await AlgoSigner.accounts({
        ledger: CHAIN_NAME,
      });
      return JSON.stringify(accts, null, 2);
    } catch (e) {
      return JSON.stringify(e.message, null, 12);
    }
  }, []);

  return (
    <ExampleAlgoSigner
      title="Get Accounts"
      buttonText="Get Accounts"
      buttonAction={action}
    />
  );
};

const GetTxParams = () => {
  const action = useCallback(async () => {
    try {
      const r = await AlgoSigner.algod({
        ledger: CHAIN_NAME,
        path: `/v2/transactions/params`,
      });
      return JSON.stringify(r, null, 2);
    } catch (e) {
      console.error(e);
      return JSON.stringify(e, null, 2);
    }
  }, []);

  return (
    <ExampleAlgoSigner
      title="Get Transaction Params"
      buttonText="Get Tx Params"
      buttonAction={action}
    />
  );
};

/* eslint-disable sonarjs/cognitive-complexity */
const SendASA = () => {
  let goldAsaInfo = Gold.default.default.asa;
  let teslaAsaInfo = Tesla.default.default.asa;
  let deployedASANames = [];
  let asaInfo = {};
  const assets = Object.entries({ ...goldAsaInfo, ...teslaAsaInfo });
  for (const [name, info] of assets) {
    asaInfo[name] = info;
    deployedASANames.push(name);
  }

  const [result, setResult] = useState('');
  const [isDialogOpen, setDialog] = useState(false);
  const [selectedASAName, setSelectedASAName] = useState(''); // selected ASA (one of deployed asa's OR other)
  const [selectedASAIndex, setSelectedASAIndex] = useState('');
  const [fromAddress, setFromAddress] = useState(''); // from account (one of algosigner.accounts)

  // state to handle toasts and loading state
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [isErr, setIsErr] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // set wallet account addresses in state
  const setAccountsAction = useCallback(async () => {
    const algoSignerAccts =
      (await AlgoSigner.accounts({
        ledger: CHAIN_NAME,
      })) ?? [];

    if (algoSignerAccts.length) {
      // TODO: update fromAddress to current active account in https://www.pivotaltracker.com/story/show/178760753
      setFromAddress(algoSignerAccts[0].address); // set first account as default selected
    } else {
      const errMsg =
        'No account found in wallet. Please create or import an existing account in algosigner wallet';
      setMessage(errMsg);
      setIsErr(true);
      setResult(errMsg);
      setDialog(false); // close modal
    }
  });

  const transfer = useCallback(async (asaIndex, senderAddress) => {
    // pass state values via functional param
    try {
      let errMsg = '';
      let receiver = document.getElementById('receiverAddr')?.value;
      let amount = document.getElementById('amount')?.value;

      if (!asaIndex) {
        errMsg = 'ASA ID is not a valid integer.';
      } else if (!receiver || !isValidAddress(receiver)) {
        errMsg = "Please enter a valid receiver's address.";
      } else if (!amount) {
        // BigInt(amount) > 0xFFFFFFFFFFFFFFFFn
        errMsg = 'Amount is not a valid number'; // uint64
      }

      if (errMsg) {
        setMessage(errMsg);
        setIsErr(true);
        setResult(errMsg);
        return;
      }

      // TODO: add support for bigint in amount value after v2 txn object is supported
      setLoading(true); // button loading state
      const [isError, message] = await transferASA(
        Number(asaIndex),
        senderAddress,
        receiver,
        Number(amount) // v1 txn object rejects bigint
      );
      setResult(message);
      setLoading(false);
      setDialog(false);

      // set toast status and message depending upon success/failure
      if (!isError) {
        setIsSuccessful(true);
      } else {
        setIsErr(true);
      }
      setMessage(message);
    } catch (e) {
      console.error(e);
      setResult(JSON.stringify(e, null, 2));
    }
  }, []);

  return (
    <div>
      <Typography variant="h5">ASA Transfer using AlgoSigner</Typography>
      <div>
        <Dialog
          open={isDialogOpen}
          onClose={() => setDialog(false)}
          aria-labelledby="form-dialog-title"
          PaperProps={{
            style: {
              padding: '5px',
            },
          }}
        >
          <DialogTitle id="form-dialog-title">Transfer ASA</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please enter transaction details
            </DialogContentText>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl
                  margin="dense"
                  fullWidth
                  style={{ marginTop: '5%' }}
                >
                  <InputLabel id="select-asa">Select ASA</InputLabel>
                  <Select
                    id="Select ASA"
                    value={selectedASAName}
                    onChange={e => {
                      const asaInfoByName = asaInfo[e.target.value];
                      if (asaInfoByName?.assetIndex) {
                        setSelectedASAIndex(asaInfoByName.assetIndex);
                      }
                      setSelectedASAName(e.target.value);
                    }}
                    autoFocus
                  >
                    {[...deployedASANames, 'Other'].map(name => (
                      <MenuItem value={name} key={name}>
                        {name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                {
                  // take asset id as input of selected asa type is 'other'
                  selectedASAName === 'Other' && (
                    <TextField
                      id="ASA ID"
                      label="Enter Asset Id"
                      variant="outlined"
                      color="secondary"
                      margin="normal"
                      type="number"
                      value={selectedASAIndex}
                      fullWidth
                      onChange={e => {
                        setSelectedASAIndex(e.target.value);
                      }}
                    />
                  )
                }
                {selectedASAName !== 'Other' && (
                  <TextField
                    variant="outlined"
                    style={{ marginTop: '7%' }}
                    margin="dense"
                    label={`${selectedASAName} asset index`}
                    value={selectedASAIndex}
                    fullWidth
                    disabled
                  />
                )}
              </Grid>
            </Grid>

            <TextField
              id="SenderAddr"
              label="Sender's Account Address"
              variant="outlined"
              color="secondary"
              margin="normal"
              fullWidth
              value={fromAddress} // currently this is just algosigner.accounts[0]
              disabled
            />

            <TextField
              id="receiverAddr"
              label="Receiver's Account Address"
              variant="outlined"
              color="secondary"
              margin="normal"
              fullWidth
            />

            <TextField
              id="amount"
              label="Amount"
              variant="outlined"
              color="secondary"
              margin="normal"
              type="number"
              fullWidth
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setDialog(false)} color="secondary">
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                if (!loading) {
                  transfer(selectedASAIndex, fromAddress);
                }
              }}
              color="primary"
            >
              {loading === false ? (
                'Send ASA'
              ) : (
                <CircularProgress
                  color="white"
                  style={{
                    padding: '8px 8px 8px 8px',
                    margin: '-6px 12px -6px 12px',
                  }}
                />
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </div>

      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setAccountsAction(); // set algosigner.accounts in state before ASA transfer
          setDialog(true);
        }}
        style={{
          margin: '5px 0px 5px 0px',
        }}
      >
        Transfer ASA
      </Button>

      {/* success toast */}
      <Snackbar
        open={isSuccessful}
        autoHideDuration={2500}
        onClose={() => {
          setIsSuccessful(false);
        }}
      >
        <Alert severity="success">{message}</Alert>
      </Snackbar>

      {/* error toast */}
      <Snackbar
        open={isErr}
        autoHideDuration={2500}
        onClose={() => {
          setIsErr(false);
        }}
      >
        <Alert severity="error">{message}</Alert>
      </Snackbar>

      <Typography>
        <code>{result}</code>
      </Typography>
    </div>
  );
};

export default function Signer() {
  return (
    <Container>
      <CssBaseline />
      <CheckAlgoSigner />
      <Connect />
      <GetAccounts />
      <GetTxParams />
      <SendASA />
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
