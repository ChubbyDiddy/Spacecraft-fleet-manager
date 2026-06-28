import React from "react";
import NavigationBar from "./components/NavigationBar";
import Motto from "./components/Motto";
import Loading from "./components/Loading";
import AppRoute from "./routes/AppRoute";
import { useLoading } from "./context/LoadingContext";

function App() {
  const { isLoading } = useLoading();

  return (
    <>
      <header>
        <NavigationBar />
      </header>

      <main className="main-container">
        <AppRoute />
      </main>

      <footer>
        <Motto />
      </footer>

      {isLoading && <Loading />}
    </>
  );
}

export default App;
