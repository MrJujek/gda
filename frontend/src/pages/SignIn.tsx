import { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/GDA-logos.jpeg";

function SignIn() {
  const [name, setName] = useState<string>("");
  const [pass, setPass] = useState<string>("");
  const [error, setError] = useState<string>("");

  const { user, signIn } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/chat");
    }
  }, [user, navigate]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setName(e.currentTarget.value);
    setError("");
  };

  const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setPass(e.currentTarget.value);
    setError("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const info = await signIn(name, pass);

    console.log("info", info);

    if (info.logged === false) {
      setError("Błędne dane");
      return;
    } else {
      sessionStorage.setItem("pass", pass);

      if (info.url.includes("chat")) {
        navigate("/chat");
      } else {
        navigate("/keys");
      }
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <img className=" w-1/2 rounded-full" src={logo} alt="GDA" />
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Zaloguj się do swojego konta
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Nazwa użytkownika
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  required
                  value={name}
                  onChange={handleNameChange}
                  className={`block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm ${
                    error && "border-red-500"
                  }`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Hasło
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={pass}
                  onChange={handlePassChange}
                  className={`block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm ${
                    error && "border-red-500"
                  }`}
                />
              </div>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Zaloguj się
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
