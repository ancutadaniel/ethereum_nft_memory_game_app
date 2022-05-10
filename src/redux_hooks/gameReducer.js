import * as ACTIONS from './constants';

export const gameReducer = (state, action) => {
  const {
    SET_WEB3,
    SET_ERROR,
    FLIP_CARD,
    SET_MATCH,
    RESET_MATCH,
    SET_TOKEN_URI,
  } = ACTIONS;

  switch (action.type) {
    case SET_WEB3:
      const { web3, contract, account, cardArray, loading } = action.value;
      return {
        ...state,
        contract,
        web3,
        account: account[0],
        cardArray,
        loading,
      };

    case FLIP_CARD:
      const id = action.value;
      const name = state.cardArray[id].name;
      return {
        ...state,
        cardChosen: [...state.cardChosen, name],
        cardChosenId: [...state.cardChosenId, id],
      };

    case SET_MATCH:
      const { cardWon, tokenURI } = action.value;

      return {
        ...state,
        cardWon: [...state.cardWon, ...cardWon],
        tokenURI: [...state.tokenURI, tokenURI],
        cardChosen: [],
        cardChosenId: [],
      };

    case SET_TOKEN_URI: {
      const tokenURIs = action.value;
      return {
        ...state,
        tokenURI: [...state.tokenURI, ...tokenURIs],
      };
    }

    case RESET_MATCH: {
      return {
        ...state,
        cardChosen: [],
        cardChosenId: [],
      };
    }

    case SET_ERROR:
      return {
        ...state,
        error: action.value,
      };

    default:
      return {
        ...state,
      };
  }
};
