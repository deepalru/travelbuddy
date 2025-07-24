import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const LoginForm: React.FC = () => {
  const { login, loginWithGoogle, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || "Google login failed");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (user) return <div>Welcome, {user.email}!</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
        required
      />
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded mb-2">Login</button>
      <button type="button" onClick={handleGoogle} className="w-full bg-red-500 text-white p-2 rounded">Login with Google</button>
    </form>
  );
};

export default LoginForm;