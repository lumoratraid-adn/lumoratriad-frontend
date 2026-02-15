import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/api/login/", {
        username,
        password,
      });

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      navigate("/dashboard");

    } catch (error) {
      console.log(error.response?.data);
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="glow-effect glow-top-left"></div>
      <div className="glow-effect glow-bottom-right"></div>

      <div className="login-card fade-in">
        <h2 className="login-title">LumoraTriad</h2>
        <p className="login-subtitle">Secure Admin Portal</p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <button type="submit" disabled={loading} className="login-button">
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
