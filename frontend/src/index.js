
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/scss/argon-dashboard-react.scss";

import AdminLayout from "layouts/Admin.js";
import AuthLayout from "layouts/Auth.js";

import routes from "routes";

import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createClient, useSwitchNetwork, WagmiConfig } from 'wagmi'
import { baseGoerli, xdcTestnet, zkSyncTestnet, polygonZkEvmTestnet, filecoinCalibration} from 'wagmi/chains'
import { MagicWeb3Provider } from "./magic/magicContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

console.log(process.env)
console.log(filecoinCalibration)
filecoinCalibration.rpcUrls.default.http = ["https://rpc.ankr.com/filecoin_testnet/f98199ca21ec0cc9f0f8d627a6e6c90a8571ecc49f39dbe2ceba0adbd7939e46"]
filecoinCalibration.rpcUrls.public.http = ["https://rpc.ankr.com/filecoin_testnet/f98199ca21ec0cc9f0f8d627a6e6c90a8571ecc49f39dbe2ceba0adbd7939e46"]
console.log(filecoinCalibration)
const chains = [filecoinCalibration]
const projectId = '780da00c6c9fb838ff77994b2d16cf2b'

const { provider } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  provider
})
const ethereumClient = new EthereumClient(wagmiClient, chains)

const App = () => {
  const getRoutes = (routes, path) => {
    return routes.map((prop, key) => {
      if (prop.layout === path) {
        console.log(prop)
        return (
          <Route
            index={prop.indexRoute}
            path={!prop.indexRoute? (prop.layout + prop.path): null} // If its a index route don't set a path
            element={<prop.component/>}
            key={key}
          />
        );
      } else {
        return null;
      }
    });
  };

  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <MagicWeb3Provider>
        <BrowserRouter>
          <Routes>
            <Route path="/admin" element={<AdminLayout />} >
                  { getRoutes(routes, "/admin")}
            </Route>
            <Route path="/auth" element={<AuthLayout />} >
                  { getRoutes(routes, "/auth")}
            </Route>  
            <Route path="/" element={ <Navigate from="/" to="/auth" /> }/>
            <Route path="*" element={<h1 className="text-center mt-8"> 404! Url Not Found!</h1> }/>
          </Routes>
        </BrowserRouter>
        </MagicWeb3Provider>
      </WagmiConfig>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  )
}

root.render(
  <App/>
);
