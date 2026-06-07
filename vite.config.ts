import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    return {
        base: '/technobeta-011/', 
        
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        plugins: [react()],
        define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            }
        },
        // Menambahkan optimasi build untuk memecah file besar
        build: {
            chunkSizeWarningLimit: 600, // Menyesuaikan ambang batas peringatan
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        // Memisahkan library besar ke file 'vendor' terpisah
                        if (id.includes('node_modules')) {
                            return 'vendor';
                        }
                    }
                }
            }
        }
    };
});