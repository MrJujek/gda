import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/GDA-logos.jpeg";

function NotFound() {
  const { user } = useAuth();

  const navigate = useNavigate();

  // useEffect(() => {
  //     if (!user) {
  //         navigate("/");
  //     }
  // }, [user, navigate]);

  return (
    <div className="flex min-h-full flex-col bg-white lg:relative">
      <div className="flex flex-grow flex-col">
        <main className="flex flex-grow flex-col bg-white">
          <div className="mx-auto flex w-full max-w-7xl flex-grow flex-col px-6 lg:px-8">
            <div className="my-auto flex-shrink-0 py-16 sm:py-28">
              <img className="h-1/2 w-1/4 rounded-full" src={logo} alt="GDA" />

              <p className="text-base font-semibold text-indigo-600">404</p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Nie znaleziono strony
              </h1>
              <p className="mt-2 text-base text-gray-500">
                Przepraszamy, nie znaleźliśmy strony, której szukasz.{" "}
              </p>
              <div className="mt-6">
                <Link
                  to={"/"}
                  className="text-base font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Wróc do strony głownej
                  <span aria-hidden="true"> &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </main>
        <footer className="flex-shrink-0 bg-gray-50">
          <div className="mx-auto w-full max-w-7xl py-8 px-6 lg:px-8 ">
            <nav className="flex space-x-4">
              <span
                className="inline-block border-l border-gray-300"
                aria-hidden="true"
              />
              <a
                href="mailto:kubus.owoc@gmail.com"
                className="font-medium text-gray-500 hover:text-gray-600 "
              >
                Contact Support
              </a>
              <span
                className="inline-block border-l border-gray-300"
                aria-hidden="true"
              />
            </nav>
          </div>
        </footer>
      </div>
      <div className="hidden lg:absolute lg:inset-y-0 lg:right-0 lg:block lg:w-1/2">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1470847355775-e0e3c35a9a2c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1825&q=80"
          alt=""
        />
      </div>
    </div>
  );
}

export default NotFound;
