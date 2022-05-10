import React, { useCallback, useEffect, useReducer } from 'react';
import { gameReducer } from './redux_hooks/gameReducer';
import { defaultState } from './redux_hooks/state';
import * as ACTIONS from './redux_hooks/constants';

import getWeb3 from './utils/getWeb3';
import { CARD_ARRAY, BLANK, WHITE } from './utils/cardArray';

import MemoryToken from '../src/build/abi/MemoryToken.json';
import MainMenu from './components/Menu';

import {
  Container,
  Divider,
  Image,
  Card,
  Message,
  Dimmer,
  Loader,
} from 'semantic-ui-react';

const App = () => {
  const [state, dispatch] = useReducer(gameReducer, defaultState);
  const {
    SET_WEB3,
    SET_ERROR,
    FLIP_CARD,
    SET_MATCH,
    RESET_MATCH,
    SET_TOKEN_URI,
  } = ACTIONS;

  const {
    account,
    contract,
    error,
    tokenURI,
    cardArray,
    cardChosen,
    cardChosenId,
    cardWon,
    loading,
  } = state;

  const loadWeb3 = useCallback(async () => {
    try {
      const web3 = await getWeb3();
      if (web3) {
        const getAccounts = await web3.eth.getAccounts();
        // get networks id of deployed contract
        const getNetworkId = await web3.eth.net.getId();
        // get contract data on this network
        const newData = await MemoryToken.networks[getNetworkId];
        // check contract deployed networks
        if (newData) {
          // get contract deployed address
          const contractAddress = newData.address;
          // create a new instance of the contract - on that specific address
          const contractData = await new web3.eth.Contract(
            MemoryToken.abi,
            contractAddress
          );

          const newRandomArr = CARD_ARRAY.sort(() => {
            return 0.5 - Math.random();
          });

          dispatch({
            type: SET_WEB3,
            value: {
              web3: web3,
              contract: contractData,
              account: getAccounts,
              cardArray: newRandomArr,
              loading: false,
            },
          });
        } else {
          alert('Smart contract not deployed to selected network');
        }
      }
    } catch (error) {
      dispatch({ type: SET_ERROR, value: error });
    }
  }, [SET_ERROR, SET_WEB3]);

  const loadBlockchain = useCallback(async () => {
    try {
      if (contract && account) {
        const nftOwned = await contract.methods.balanceOf(account).call();
        let tokenURIArr = [];
        // get token URI
        for (let i = 0; i < nftOwned; i++) {
          const newArr = await contract.methods.tokenURI(i.toString()).call();
          tokenURIArr.push(newArr);
        }
        dispatch({ type: SET_TOKEN_URI, value: tokenURIArr });
      }
    } catch (error) {
      dispatch({ type: SET_ERROR, value: error });
    }
  }, [contract, account, SET_ERROR, SET_TOKEN_URI]);

  // 1 - display the game images
  const handleImage = (idx) => {
    const { img: imgBlank } = BLANK;
    const { img: imgWhite } = WHITE;

    if (cardWon.includes(idx)) {
      return imgWhite;
    } else if (cardChosenId.includes(idx)) {
      return cardArray[idx].img;
    }

    return imgBlank;
  };

  // 2 - select the image clicked by attribute
  const handleFlip = (e) => {
    let id = e.target.getAttribute('data-id').toString();
    // if id is not in card won then flip the card nad update card chosen & card chosen id
    if (!cardWon.includes(id)) dispatch({ type: FLIP_CARD, value: id });
  };

  const checkForMatch = useCallback(async () => {
    try {
      // check if click same image by id
      if (cardChosenId[0] === cardChosenId[1]) {
        alert('You have clicked the same image');
        dispatch({ type: RESET_MATCH });
        // check if match the same image name
      } else if (cardChosen[0] === cardChosen[1]) {
        alert('You found a match');
        // get img URI
        const saveTokenUri = cardArray[cardChosenId[0]].img;
        // mint and set URI on smart contract blockchain
        await contract.methods.awardItem(account, saveTokenUri).send({
          from: account,
        });
        // update the state of match
        dispatch({
          type: SET_MATCH,
          value: {
            cardWon: [cardChosenId[0], cardChosenId[1]],
            tokenURI: saveTokenUri,
          },
        });
      } else {
        alert('Sorry , try again');
        dispatch({ type: RESET_MATCH });
      }

      if (cardWon.length === cardArray.length) {
        alert('Congratulation! You found them all!');
      }
    } catch (error) {
      dispatch({ type: SET_ERROR, value: error });
    }
  }, [
    cardChosenId,
    account,
    cardArray,
    cardChosen,
    cardWon,
    contract.methods,
    RESET_MATCH,
    SET_ERROR,
    SET_MATCH,
  ]);

  // 3 - check number of cards chosen
  useEffect(() => {
    if (cardChosen.length === 2) {
      setTimeout(() => {
        checkForMatch();
      }, 100);
    }
  }, [cardChosen, checkForMatch]);

  useEffect(() => {
    loadBlockchain();
  }, [contract, loadBlockchain]);

  useEffect(() => {
    loadWeb3();
  }, [loadWeb3]);

  return (
    <div className='App'>
      <MainMenu account={account} />
      <Divider horizontal>§</Divider>
      {loading ? (
        <Container
          style={{
            width: '320px',
            height: '320px',
          }}
        >
          <Card centered>
            <Dimmer
              active={loading}
              style={{
                width: '320px',
                height: '100px',
              }}
            >
              <Loader active={loading} />
            </Dimmer>
          </Card>
        </Container>
      ) : (
        <Container>
          <Card
            centered
            style={{ width: '320px', flexDirection: 'row', flexWrap: 'wrap' }}
          >
            {cardArray.map((_card, idx) => {
              return (
                <Image
                  key={idx}
                  data-id={idx}
                  src={handleImage(idx.toString())}
                  onClick={handleFlip}
                  size='tiny'
                />
              );
            })}
          </Card>
        </Container>
      )}
      <Divider horizontal>§</Divider>
      <Container>
        <Card
          centered
          style={{ width: '508px', flexDirection: 'row', flexWrap: 'wrap' }}
        >
          <Card.Content>
            <Card.Header>NFT Collected: {tokenURI.length}</Card.Header>
          </Card.Content>
          <Card.Content>
            {tokenURI.map((nft, key) => {
              return <Image key={key} src={nft} size='tiny' />;
            })}
          </Card.Content>
        </Card>
      </Container>
      <Divider horizontal>§</Divider>
      <Container>
        {error && (
          <Message negative>
            <Message.Header>Code: {error?.code}</Message.Header>
            <p style={{ wordWrap: 'break-word' }}>{error?.message}</p>
          </Message>
        )}
      </Container>
    </div>
  );
};

export default App;
