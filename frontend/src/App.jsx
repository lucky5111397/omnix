import React, { useEffect } from "react";
import Home from "./pages/Home";
import { useDispatch } from "react-redux";
import getCurrentUser from "./features/getCurrentUser";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    getCurrentUser(dispatch);
  }, [dispatch]);

  return <Home />;
}

export default App;