import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import rootReducer from "./reducers";

const initialState = {};

const middleware = [thunk];

// takes root reducer, initial state, and middlewares
const store = createStore(
  rootReducer,
  initialState,
  compose(
    applyMiddleware(...middleware),
  )
);

export default store;
