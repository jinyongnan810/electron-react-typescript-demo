import { createStore, applyMiddleware } from "redux";
import { configureStore, MiddlewareArray } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import rootReducer from "./reducers";

const initialState = {};
const middlewares = [thunk];

const store = configureStore({
  reducer: rootReducer,
  middleware: new MiddlewareArray().concat(...middlewares),
  preloadedState: {},
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
