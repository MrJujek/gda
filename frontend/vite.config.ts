import { readFileSync } from "fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import dotenv from "dotenv";

dotenv.config();

const apiHost = "server";
const keyPath = process.env.GDA_KEY_PATH || "./config/server.key";
const certPath = process.env.GDA_CERT_PATH || "./config/server.crt";

let httpsConfig: { key: File; cert: File };
let proxyConfig = {
	"/api": {
		target: "http://" + apiHost,
		secure: false,
	},
	"/api/chat": {
		ws: true,
		target: "ws://" + apiHost,
	},
};

if (process.env.GDA_SECURE_SERVER == 1) {
	httpsConfig = {
		key: readFileSync(keyPath),
		cert: readFileSync(certPath),
	};
	proxyConfig["/api"].target = "https://" + apiHost;
}

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		port: 3000,
		cors: false,
		proxy: proxyConfig,
		https: httpsConfig,
		host: "0.0.0.0",
		watch: {
			usePolling: true,
			interval: 100,
		},
	},
	preview: {
		port: 3000,
		cors: false,
		proxy: proxyConfig,
		https: httpsConfig,
	}
});
