import Login from "./Login";
import Profile from "./Profile";

function App() {
  const token = localStorage.getItem("token");
  return token ? <Profile /> : <Login />;
}

export default App;
