declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MINA_DEV_PRIVATE_KEY: string;
        }
    }
}

export { }