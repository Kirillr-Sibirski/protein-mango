declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NEXT_PUBLIC_MINA_DEV_PRIVATE_KEY: string;
        }
    }
}

export { }