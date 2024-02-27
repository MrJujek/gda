import { readFileSync } from "fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import dotenv from 'dotenv'

dotenv.config()

let httpsConfig: {key: File, cert: File};
const keyPath = process.env.GDA_KEY_PATH || './config/server.key'
const certPath = process.env.GDA_CERT_PATH || './config/server.crt'

if (process.env.GDA_SECURE_SERVER == 1) {
	httpsConfig = {
		key: readFileSync(keyPath),
		cert: readFileSync(certPath)
	}
}

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		port: 3000,
		proxy: {
			"/api": "http://localhost",
		},
		https: httpsConfig
	},
});